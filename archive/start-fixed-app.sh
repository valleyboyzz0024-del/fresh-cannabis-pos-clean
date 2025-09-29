#!/bin/bash

# Exit on error
set -e

echo "Starting Cannabis POS app with header crash fix..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Apply the useHeaderConfigProps.js patch
echo "Applying useHeaderConfigProps.js patch..."
node fix-header-config.js

# Start the app
echo "Starting the app..."
npx expo start