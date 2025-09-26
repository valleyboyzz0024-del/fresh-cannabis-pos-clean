#!/bin/bash

# Exit on error
set -e

echo "===== Fresh Cannabis POS - Fix Medium Error Script ====="
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to display a section header
section() {
  echo ""
  echo "===== $1 ====="
  echo ""
}

# Check for Node.js
if ! command_exists node; then
  echo "Error: Node.js is required but not installed."
  exit 1
fi

# Create a backup directory
section "Creating Backups"
mkdir -p backups
cp -f App.js backups/App.js.bak || echo "Could not backup App.js (may not exist yet)"
cp -f src/theme/theme.js backups/theme.js.bak || echo "Could not backup theme.js (may not exist yet)"
echo "Backups created in ./backups directory"

# Fix the theme.js file
section "Fixing Theme File"
node fix-theme-complete.js

# Create utils directory if it doesn't exist
section "Creating Utils Directory"
mkdir -p src/utils
echo "Utils directory created"

# Replace App.js with the fixed version
section "Replacing App.js"
node replace-app-updated.js

# Clear cache
section "Clearing Cache"
echo "Removing node_modules/.cache..."
rm -rf node_modules/.cache
echo "Removing .expo..."
rm -rf .expo

# Create a summary of fixes
section "Creating Fix Summary"
cat > MEDIUM_ERROR_FIXED.md << 'EOF'
# Medium Error Fix Summary

## Problem
The app was experiencing a "Cannot read property 'medium' of undefined" error, which occurs when trying to access a property of an undefined object.

## Solution
We implemented a comprehensive solution to fix this issue:

1. **Fixed Theme Structure**
   - Ensured the theme.js file has all required properties
   - Added missing font variants including 'medium'
   - Added a sizes object with 'medium' property

2. **Added Safe Theme Access**
   - Created a safeTheme utility that provides safe access to theme properties
   - Added null checks for all theme property access
   - Implemented fallback values for missing properties

3. **Added Platform-Compatible Error Handler**
   - Implemented a global error handler that works on both native and web platforms
   - Added detailed error reporting to help diagnose issues
   - Fixed the "Cannot read properties of undefined (reading 'setGlobalHandler')" error

4. **Updated App.js**
   - Replaced the original App.js with a fixed version
   - Added initialization code to ensure all theme properties exist
   - Used safe theme access throughout the app

## How to Test
1. Run the app with `npx expo start --clear`
2. Navigate through different screens
3. Check the console for any errors

## Next Steps
If you encounter any other issues, please provide the error message and we can address it specifically.
EOF

echo "Fix summary created in MEDIUM_ERROR_FIXED.md"

# Start the app
section "Starting the App"
echo "Starting Expo app with cleared cache..."
echo ""
echo "Press Ctrl+C to exit"
echo ""

# Start the app
npx expo start --clear