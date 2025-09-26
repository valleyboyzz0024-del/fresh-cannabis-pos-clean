/**
 * Replace App.js Script
 * 
 * This script replaces the original App.js file with the fixed version
 * that includes error handling and safe theme access.
 */

const fs = require('fs');
const path = require('path');

// Paths to the App.js files
const originalAppPath = path.join(__dirname, 'App.js');
const fixedAppPath = path.join(__dirname, 'App-fixed.js');
const backupAppPath = path.join(__dirname, 'App.js.bak');

// Function to replace the App.js file
function replaceAppFile() {
  try {
    // Check if the fixed App.js file exists
    if (!fs.existsSync(fixedAppPath)) {
      console.error('Fixed App.js file not found');
      return false;
    }
    
    // Create a backup of the original App.js file
    if (fs.existsSync(originalAppPath)) {
      fs.copyFileSync(originalAppPath, backupAppPath);
      console.log('Created backup of original App.js file');
    }
    
    // Copy the fixed App.js file to replace the original
    fs.copyFileSync(fixedAppPath, originalAppPath);
    console.log('Replaced App.js with fixed version');
    
    return true;
  } catch (error) {
    console.error('Error replacing App.js file:', error);
    return false;
  }
}

// Main function
function main() {
  console.log('=== Replace App.js Script ===');
  
  const success = replaceAppFile();
  if (success) {
    console.log('App.js file has been replaced successfully');
  } else {
    console.error('Failed to replace App.js file');
  }
}

// Run the script
main();