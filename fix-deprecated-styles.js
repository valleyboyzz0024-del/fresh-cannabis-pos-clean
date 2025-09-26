/**
 * Fix Deprecated Styles Script
 * 
 * This script finds and fixes deprecated style props in the React Native application:
 * 1. Replaces shadow* props with boxShadow* props
 * 2. Replaces pointerEvents prop with style.pointerEvents
 */

const fs = require('fs');
const path = require('path');

// Configuration
const srcDir = path.join(__dirname, 'src');

// Function to recursively get all JS files in a directory
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix shadow* props in a file
function fixShadowProps(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses shadow* props
    const hasShadowProps = /shadowColor|shadowOffset|shadowOpacity|shadowRadius/.test(content);
    
    if (hasShadowProps) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);
      
      // Replace shadowColor with boxShadowColor
      content = content.replace(/shadowColor/g, 'boxShadowColor');
      
      // Replace shadowOffset with boxShadowOffset
      content = content.replace(/shadowOffset/g, 'boxShadowOffset');
      
      // Replace shadowOpacity with boxShadowOpacity
      content = content.replace(/shadowOpacity/g, 'boxShadowOpacity');
      
      // Replace shadowRadius with boxShadowRadius
      content = content.replace(/shadowRadius/g, 'boxShadowRadius');
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed shadow props in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to fix pointerEvents props in a file
function fixPointerEventsProps(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses pointerEvents as a prop
    const hasPointerEventsProp = /pointerEvents=["']([^"']*)["']/.test(content);
    
    if (hasPointerEventsProp) {
      console.log(`Checking pointerEvents in ${path.relative(__dirname, filePath)}`);
      
      // Replace pointerEvents prop with style.pointerEvents
      content = content.replace(
        /(<[A-Za-z][A-Za-z0-9]*[^>]*?)pointerEvents=["']([^"']*)["']([^>]*?>)/g,
        (match, prefix, value, suffix) => {
          // Check if there's already a style prop
          if (prefix.includes('style={')) {
            // Append to existing style object
            return prefix.replace(
              /style=\{([^}]*)\}/,
              `style={{$1, pointerEvents: '${value}'}}`
            ) + suffix;
          } else {
            // Add new style prop
            return `${prefix} style={{pointerEvents: '${value}'}}${suffix}`;
          }
        }
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed pointerEvents props in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to fix TouchableWithoutFeedback components
function fixTouchableWithoutFeedback(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses TouchableWithoutFeedback
    const usesTouchableWithoutFeedback = content.includes('TouchableWithoutFeedback');
    
    if (usesTouchableWithoutFeedback) {
      console.log(`Fixing TouchableWithoutFeedback in ${path.relative(__dirname, filePath)}`);
      
      // Replace import statement
      content = content.replace(
        /import\s*{([^}]*)TouchableWithoutFeedback([^}]*)}(\s*)from\s*['"]react-native['"];/,
        (match, before, after, spaces) => {
          return `import {${before}Pressable${after}}${spaces}from 'react-native';`;
        }
      );
      
      // Replace component usage
      content = content.replace(
        /<TouchableWithoutFeedback([^>]*)>/g,
        '<Pressable$1>'
      );
      
      content = content.replace(
        /<\/TouchableWithoutFeedback>/g,
        '</Pressable>'
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed TouchableWithoutFeedback in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('=== Fix Deprecated Styles Script ===');
  
  try {
    const files = getAllJsFiles(srcDir);
    let shadowFixCount = 0;
    let pointerEventsFixCount = 0;
    let touchableFixCount = 0;
    
    files.forEach(file => {
      if (fixShadowProps(file)) {
        shadowFixCount++;
      }
      if (fixPointerEventsProps(file)) {
        pointerEventsFixCount++;
      }
      if (fixTouchableWithoutFeedback(file)) {
        touchableFixCount++;
      }
    });
    
    console.log('\n=== Fix Summary ===');
    console.log(`Fixed shadow props in ${shadowFixCount} files`);
    console.log(`Fixed pointerEvents props in ${pointerEventsFixCount} files`);
    console.log(`Fixed TouchableWithoutFeedback in ${touchableFixCount} files`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Run the script
main();