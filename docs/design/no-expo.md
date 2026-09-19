# Why this app does not use Expo

Decided 2026-09-18. The app was built on Expo SDK 57 (expo-router, expo-sqlite,
expo-file-system, a local Expo module) and now runs on bare React Native 0.86.

## The problem

This is a one-person iOS app whose whole point is a native framework — Core
Spotlight. Expo was overhead on every axis that mattered and help on none:

- **Expo Go could never run it.** Core Spotlight is not in the Expo Go binary, so
  the only way to see the feature was a development build. Expo Go was a second
  runtime that had to be kept working — degraded code paths, a "not available"
  banner, a second set of instructions in the README — for a mode that could not
  exercise the app's reason to exist.
- **It wanted an account.** Expo Go, EAS and the dashboard push a login for what
  is a local `xcodebuild` on a local simulator. Nothing here is shared, built in
  the cloud, or over-the-air updated.
- **An extra layer between the code and the platform.** `ios/` was generated and
  gitignored, so every native change went through prebuild and config plugins
  instead of the file it actually edits. The scene-lifecycle fix for iOS 27 had to
  be written as a regex that patched Expo's generated `AppDelegate.swift`.
- **Buggy in ways that cost time.** Prebuild regenerating the project, the config
  plugin breaking when the template moved, dev-client and Metro disagreeing about
  which bundle to serve. Debugging the tool rather than the app.

## The decision

Remove Expo entirely — not just Expo Go. The SDK's value is the managed workflow,
and none of it is wanted here; keeping the SDK would mean keeping prebuild,
config plugins and the account prompts that came with it.

| Was | Now |
|---|---|
| expo-router | `@react-navigation/native` + native-stack + bottom-tabs |
| expo-sqlite | `@op-engineering/op-sqlite` behind `src/db/database.ts` |
| expo-file-system (`File.pickFileAsync`) | `modules/text-file-picker`, a local module |
| Expo module API (Swift) | TurboModule (ObjC++) in `modules/spotlight-index` |
| @expo/vector-icons | `@react-native-vector-icons/ionicons` |
| expo-status-bar | `StatusBar` from react-native |
| expo prebuild + config plugin | `ios/` is checked in and edited directly |
| expo-constants, expo-linking, expo-dev-client | dropped, nothing used them |

## What this costs

- **`ios/` is ours to maintain.** Upgrading React Native means merging template
  changes by hand instead of re-running prebuild.
- **No OTA updates, no cloud builds.** Neither was in use.
- **The scene delegate is hand-written.** iOS 27 refuses to launch an app that
  drives its window from the app delegate, and the bare RN 0.86 template still
  does; `AppDelegate.swift` carries a `SceneDelegate` that owns the window and
  forwards Spotlight taps. This replaces the config plugin that used to patch the
  same thing after the fact — same amount of code, in the file it belongs in.

## What this buys

One runtime, one build command, no account. `npm run ios` compiles the native
module and installs the app; what runs in the simulator is what ships.
