#!/usr/bin/env bash
echo "This will probably take a minute or two."

echo "   >>>>>> Deleting Android Gradle cache >>>>>" &&
cd android && ./gradlew clean && cd .. &&

echo "   >>>>>> Deleteing watchman cache >>>>>" &&
watchman watch-del-all &&

echo "   >>>>>> Deleteing tmpDir ( $TMPDIR ) - react-native cache and bundler cache >>>>>" &&
rm -rf $TMPDIR/react-native-packager-cache-* && rm -rf $TMPDIR/metro-bundler-cache-* &&

echo "   >>>>>> Cleaning Yarn cache >>>>>" &&
yarn cache clean &&

echo "   >>>>>> Start yarn so we can reset the transform cache, you can use control+c to quit >>>>>" &&
yarn react-native start --reset-cache;

