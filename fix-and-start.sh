#!/bin/bash

# Exit on error
set -e

echo "Starting Cannabis POS app fix and launch script..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Apply the FontProcessor.js patch
echo "Applying FontProcessor.js patch..."
node fix-font-processor.js

# Start the app
echo "Starting the app..."
npx expo start