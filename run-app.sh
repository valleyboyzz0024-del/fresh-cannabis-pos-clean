#!/bin/bash

# Exit on error
set -e

echo "Starting Cannabis POS app..."

# Run the fix scripts
node fix-paper-theme.js
node fix-text-component-complete.js
node fix-text-imports.js
node replace-header-config.js
node fix-useEffect-imports.js
node fix-shadow-props.js
node fix-pointer-events.js
node fix-all-warnings.js

# Clear cache
rm -rf node_modules/.cache
rm -rf .expo

# Start the app
npx expo start --clear
