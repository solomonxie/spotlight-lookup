const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

/**
 * iOS 27 refuses to launch an app that still drives its window from the app delegate.
 * Expo SDK 57 ships `ExpoAppSceneDelegate` for this but does not wire it up during
 * prebuild, so this plugin does: it declares a scene manifest and moves window
 * creation out of `AppDelegate`. Drop it once an SDK does this itself.
 */

const SCENE_MANIFEST = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
      },
    ],
  },
};

const LEGACY_WINDOW_SETUP =
  /#if os\(iOS\) \|\| os\(tvOS\)\s*\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*\n\s*factory\.startReactNative\([\s\S]*?\)\s*\n#endif\n/;

const SCENE_DELEGATE = `
// The scene delegate owns the window and hands life-cycle events back to AppDelegate.
class SceneDelegate: ExpoAppSceneDelegate {}
`;

function patchAppDelegate(contents) {
  if (contents.includes('class SceneDelegate')) return contents;

  let patched = contents.replace(
    'class AppDelegate: ExpoAppDelegate {',
    'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
  );
  patched = patched.replace(LEGACY_WINDOW_SETUP, '');

  if (patched === contents || LEGACY_WINDOW_SETUP.test(patched)) {
    throw new Error(
      'with-scene-lifecycle: AppDelegate.swift does not look like the Expo template it patches.'
    );
  }
  return `${patched}${SCENE_DELEGATE}`;
}

module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = SCENE_MANIFEST;
    return mod;
  });

  return withAppDelegate(config, (mod) => {
    mod.modResults.contents = patchAppDelegate(mod.modResults.contents);
    return mod;
  });
};
