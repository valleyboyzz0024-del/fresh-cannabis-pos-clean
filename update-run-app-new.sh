#!/bin/bash

# Update the run-app.sh script to include our new fix scripts
cat > run-app.sh << 'EOF'
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
node fix-font-variants.js
node fix-touchable-without-feedback.js

# Clear cache
rm -rf node_modules/.cache
rm -rf .expo

# Start the app
npx expo start --clear
EOF

# Make the script executable
chmod +x run-app.sh

echo "Updated run-app.sh with new fix scripts"