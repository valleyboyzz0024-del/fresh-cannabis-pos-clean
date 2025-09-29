#!/bin/bash

# CannaFlow App Setup and Run Script
echo "🌿 Setting up CannaFlow App..."

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/expo" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Install canvas for icon generation if needed
if ! npm list canvas > /dev/null 2>&1; then
  echo "📦 Installing canvas for icon generation..."
  npm install canvas
fi

# Generate app icons
echo "🎨 Generating app icons..."
node generate-icons.js

# Fix deprecated props
echo "🔧 Fixing deprecated props..."
node fix-deprecated-props.js

# Apply all fixes
echo "🔧 Applying all fixes..."

# Run the app
echo "🚀 Starting CannaFlow App..."
echo "📱 Use one of the following commands to run the app:"
echo "   - npm run web     (for web)"
echo "   - npm run android (for Android)"
echo "   - npm run ios     (for iOS)"
echo ""
echo "🔑 Default login credentials: admin / admin123"

# Start the app in web mode
npm run web