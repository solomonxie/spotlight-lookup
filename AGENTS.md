# Spotlight Lookup

Bare React Native 0.86, iOS only. **No Expo** — read `docs/design/no-expo.md`
before reaching for an `expo-*` package or an Expo workflow.

- `ios/` is checked in and edited directly. There is no prebuild, no config plugin.
- Native code lives in `modules/<name>` as local TurboModules, autolinked through
  `react-native.config.js`.
- Run: `npm run ios`. After changing a native dependency: `npm run pods`.
