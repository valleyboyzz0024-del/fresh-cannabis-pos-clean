#!/bin/bash

# CannaFlow AI Assistant & Canada Compliance Engine Setup Script

echo "===== CannaFlow AI Assistant & Canada Compliance Engine Setup ====="
echo "This script will install the necessary dependencies and set up the AI and compliance features."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install expo-speech@~10.2.0 \
          expo-file-system@~14.0.0 \
          expo-sharing@~10.2.0 \
          expo-document-picker@~10.2.0

# Create necessary directories
echo "Creating directories..."
mkdir -p src/components
mkdir -p src/context
mkdir -p src/services

# Copy new files
echo "Setting up AI Assistant and Compliance Engine..."

# Update package.json
echo "Updating package.json..."
if [ -f "package.json.new" ]; then
    mv package.json.new package.json
    echo "Package.json updated successfully."
else
    echo "Warning: package.json.new not found. Skipping package.json update."
fi

echo "Setup complete!"
echo ""
echo "To run the app, use the following command:"
echo "npm start"
echo ""
echo "For more information, please refer to README_AI_COMPLIANCE.md"