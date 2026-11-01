# Spotlight Lookup

Bare React Native 0.86, iOS only. **No Expo** — read `docs/design/no-expo.md`
before reaching for an `expo-*` package or an Expo workflow.

- `ios/` is checked in and edited directly. There is no prebuild, no config plugin.
- Native code lives in `modules/<name>` as local TurboModules, autolinked through
  `react-native.config.js`.
- After changing a native dependency: `npm run pods`.

## Running the app

- **Physical iPhone only.** Never build for, install on, launch, or screenshot a
  simulator — not to check a change, not as a fallback. Only when explicitly
  asked, that one time.
- Install: `npm run ios` — Release build, JS embedded.
- **No dev server.** No Metro server, no `npm start`, no `run-ios` without
  `--no-packager`. `AppDelegate.bundleURL` always reads the embedded
  `main.jsbundle`; install to see a change. (Metro still runs inside the Xcode
  build phase as the bundler — a build step, not a server.)
- **No device connected → stop and say so.** Don't fall back to a simulator.
- Everything else (typecheck, tests, lint, reading code) is the default way to
  verify a change.
