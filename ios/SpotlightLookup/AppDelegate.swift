import CoreSpotlight
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // The window is created by SceneDelegate: iOS 27 asserts at launch on an app
    // that still drives its window from the app delegate.
    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    // Mirrored onto the app delegate for the React Native code that reads it there.
    appDelegate.window = window

    factory.startReactNative(withModuleName: "SpotlightLookup", in: window, launchOptions: nil)

    // A tap that cold-starts the app arrives here rather than through `scene(_:continue:)`.
    connectionOptions.userActivities.forEach(deliverSpotlightOpen)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    deliverSpotlightOpen(userActivity)
  }

  /// Spotlight result taps arrive as an NSUserActivity; the registry buffers the one
  /// that lands before JavaScript is listening.
  private func deliverSpotlightOpen(_ userActivity: NSUserActivity) {
    guard userActivity.activityType == CSSearchableItemActionType,
          let identifier = userActivity.userInfo?[CSSearchableItemActivityIdentifier] as? String else {
      return
    }
    SpotlightOpenRegistry.shared.deliver(identifier)
  }
}
