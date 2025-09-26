#!/bin/bash

# Fix all deprecation warnings in the React Native app

echo "Starting to fix all deprecation warnings..."

# 1. Fix pointerEvents prop warnings
echo "Fixing pointerEvents prop warnings..."
node fix-pointer-events.js

# 2. Fix shadow* style props warnings
echo "Fixing shadow* style props warnings..."
node fix-shadow-props.js

# 3. Fix animation useNativeDriver warnings
echo "Fixing animation useNativeDriver warnings..."
node fix-animation-warnings.js

# 4. Fix TouchableWithoutFeedback deprecation (if exists)
if [ -f "fix-touchable-without-feedback.js" ]; then
  echo "Fixing TouchableWithoutFeedback deprecation..."
  node fix-touchable-without-feedback.js
fi

echo "All deprecation warnings have been fixed!"
echo "To run the app with the fixes, use: npm run web"
echo "For native platforms, make sure to run: bundle exec pod install (iOS) or rebuild Android"