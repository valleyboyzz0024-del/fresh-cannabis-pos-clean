#!/bin/bash

# Exit on error
set -e

echo "Starting Cannabis POS app with stable launch configuration..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Replace useHeaderConfigProps.js with our stub
echo "Replacing useHeaderConfigProps.js with stub..."
node replace-header-config.js

# Fix React Native Paper theme
echo "Fixing React Native Paper theme..."
node fix-paper-theme.js

# Clear cache
echo "Clearing cache completely..."
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear

# Exit the expo process after it starts
echo "Press Ctrl+C when the QR code appears, then scan it on your device"