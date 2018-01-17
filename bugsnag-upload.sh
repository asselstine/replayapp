#! /bin/bash
react-native bundle \
  --platform ios \
  --entry-file index.ios.js \
  --bundle-output dist/ios-release.bundle \
  --sourcemap-output dist/ios-release.bundle.map
bugsnag-sourcemaps upload \
  --api-key $BUGSNAG_API_KEY \
  --minified-file dist/ios-release.bundle \
  --source-map dist/ios-release.bundle.map \
  --minified-url main.jsbundle \
  --upload-sources
