Local native modules, one folder each: a podspec, a codegen spec under `src/`,
and the Objective-C++ that implements it. `react-native.config.js` at the repo
root points autolinking here, so they build like any installed library without
being published.
