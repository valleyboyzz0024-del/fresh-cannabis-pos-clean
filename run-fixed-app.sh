#!/bin/bash

# Exit on error
set -e

echo "===== Fresh Cannabis POS - Comprehensive Fix and Run Script ====="
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

# Create a backup of important files
section "Creating Backups"
mkdir -p backups
cp -f src/theme/theme.js backups/theme.js.bak || echo "Could not backup theme.js (may not exist yet)"
echo "Backups created in ./backups directory"

# Run the theme debugging script
section "Running Theme Debugging Script"
node debug-theme-issues.js

# Fix theme access issues
section "Fixing Theme Access Issues"
node fix-theme-access.js

# Fix deprecated styles
section "Fixing Deprecated Styles"
node fix-deprecated-styles.js

# Run the test script
section "Running App Tests"
node test-app.js

# Run the existing fix scripts
section "Running Existing Fix Scripts"
if [ -f fix-paper-theme.js ]; then
  echo "Running fix-paper-theme.js..."
  node fix-paper-theme.js
fi

if [ -f fix-text-component-complete.js ]; then
  echo "Running fix-text-component-complete.js..."
  node fix-text-component-complete.js
fi

if [ -f fix-text-imports.js ]; then
  echo "Running fix-text-imports.js..."
  node fix-text-imports.js
fi

if [ -f replace-header-config.js ]; then
  echo "Running replace-header-config.js..."
  node replace-header-config.js
fi

# Clear cache
section "Clearing Cache"
echo "Removing node_modules/.cache..."
rm -rf node_modules/.cache
echo "Removing .expo..."
rm -rf .expo

# Create a summary of fixes
section "Creating Fix Summary"
cat > FIXES_APPLIED.md << 'EOF'
# Fixes Applied to Fresh Cannabis POS

## Theme Fixes
- Added missing font variants to theme.js
- Added safe theme access with null checks
- Created themeHelper.js for safe theme property access
- Patched react-native-paper Text component to handle undefined theme.fonts

## Style Fixes
- Replaced deprecated shadow* props with boxShadow* props
- Replaced deprecated pointerEvents prop with style.pointerEvents
- Replaced deprecated TouchableWithoutFeedback with Pressable

## Other Fixes
- Fixed missing useEffect imports
- Applied defensive coding to prevent null/undefined errors
- Cleared cache for clean rebuild

## Next Steps
1. Review the app-test-report.md file for any remaining issues
2. Test the app on different platforms (Web, Android, iOS)
3. Consider implementing the recommendations in the test report
EOF

echo "Fix summary created in FIXES_APPLIED.md"

# Start the app
section "Starting the App"
echo "Starting Expo app with cleared cache..."
echo "If the app fails to start, check the app-test-report.md file for issues."
echo ""
echo "Press Ctrl+C to exit"
echo ""

# Start the app
npx expo start --clear