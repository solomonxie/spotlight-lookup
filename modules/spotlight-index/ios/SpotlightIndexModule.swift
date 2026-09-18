import CoreSpotlight
import ExpoModulesCore
import UniformTypeIdentifiers

let spotlightOpenNotification = Notification.Name("SpotlightLookup.open")

/// Holds the identifier of a Spotlight result tapped before JavaScript was ready.
public final class SpotlightOpenRegistry {
  public static let shared = SpotlightOpenRegistry()

  private let lock = NSLock()
  private var pendingIdentifier: String?

  public func deliver(_ identifier: String) {
    lock.lock()
    pendingIdentifier = identifier
    lock.unlock()
    NotificationCenter.default.post(
      name: spotlightOpenNotification,
      object: nil,
      userInfo: ["id": identifier]
    )
  }

  func take() -> String? {
    lock.lock()
    defer {
      pendingIdentifier = nil
      lock.unlock()
    }
    return pendingIdentifier
  }
}

struct SpotlightItemRecord: Record {
  @Field var id: String = ""
  @Field var domain: String = ""
  @Field var title: String = ""
  @Field var subtitle: String?
  @Field var body: String?
  @Field var keywords: [String] = []
}

public class SpotlightIndexModule: Module {
  private var openObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("SpotlightIndex")

    Events("onSpotlightOpen")

    OnCreate {
      self.openObserver = NotificationCenter.default.addObserver(
        forName: spotlightOpenNotification,
        object: nil,
        queue: .main
      ) { [weak self] notification in
        guard let identifier = notification.userInfo?["id"] as? String else {
          return
        }
        self?.sendEvent("onSpotlightOpen", ["id": identifier])
      }
    }

    OnDestroy {
      if let observer = self.openObserver {
        NotificationCenter.default.removeObserver(observer)
      }
    }

    Function("isAvailable") {
      CSSearchableIndex.isIndexingAvailable()
    }

    Function("takePendingOpen") { () -> String? in
      SpotlightOpenRegistry.shared.take()
    }

    AsyncFunction("indexItems") { (items: [SpotlightItemRecord], promise: Promise) in
      CSSearchableIndex.default().indexSearchableItems(items.map(makeSearchableItem)) { error in
        settle(promise, error)
      }
    }

    AsyncFunction("deleteItems") { (ids: [String], promise: Promise) in
      CSSearchableIndex.default().deleteSearchableItems(withIdentifiers: ids) { error in
        settle(promise, error)
      }
    }

    AsyncFunction("deleteDomains") { (domains: [String], promise: Promise) in
      CSSearchableIndex.default().deleteSearchableItems(withDomainIdentifiers: domains) { error in
        settle(promise, error)
      }
    }

    AsyncFunction("deleteAll") { (promise: Promise) in
      CSSearchableIndex.default().deleteAllSearchableItems { error in
        settle(promise, error)
      }
    }
  }
}

private func makeSearchableItem(_ item: SpotlightItemRecord) -> CSSearchableItem {
  let attributes = CSSearchableItemAttributeSet(contentType: UTType.text)
  attributes.identifier = item.id
  attributes.title = item.title
  attributes.displayName = item.title
  attributes.contentDescription = [item.subtitle, item.body]
    .compactMap { $0 }
    .filter { !$0.isEmpty }
    .joined(separator: "\n")

  if !item.keywords.isEmpty {
    attributes.keywords = item.keywords
    attributes.alternateNames = item.keywords
  }

  let searchableItem = CSSearchableItem(
    uniqueIdentifier: item.id,
    domainIdentifier: item.domain,
    attributeSet: attributes
  )
  // Without this iOS drops the item from the index after a month of no interaction.
  searchableItem.expirationDate = Date.distantFuture
  return searchableItem
}

private func settle(_ promise: Promise, _ error: Error?) {
  if let error {
    promise.reject("ERR_SPOTLIGHT_INDEX", error.localizedDescription)
  } else {
    promise.resolve(nil)
  }
}
