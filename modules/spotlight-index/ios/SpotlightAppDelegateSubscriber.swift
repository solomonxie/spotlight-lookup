import CoreSpotlight
import ExpoModulesCore

/// Spotlight result taps arrive as an NSUserActivity on the app delegate, which is
/// outside anything expo-linking observes, so the module listens for it here.
public class SpotlightAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([any UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    guard userActivity.activityType == CSSearchableItemActionType,
          let identifier = userActivity.userInfo?[CSSearchableItemActivityIdentifier] as? String else {
      return false
    }
    SpotlightOpenRegistry.shared.deliver(identifier)
    return true
  }
}
