/**
 * Fix Theme Access Script
 * 
 * This script specifically addresses the "Cannot read property 'medium' of undefined" error
 * by adding defensive coding to theme access throughout the codebase.
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

// Function to fix unsafe theme access in a file
function fixUnsafeThemeAccess(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses theme.fonts
    const hasThemeFonts = /theme\.fonts/.test(content);
    
    if (hasThemeFonts) {
      console.log(`Checking theme access in ${path.relative(__dirname, filePath)}`);
      
      // Pattern 1: Direct access to theme.fonts.X
      // Replace theme.fonts.X with (theme.fonts && theme.fonts.X ? theme.fonts.X : defaultFont)
      content = content.replace(
        /theme\.fonts\.([a-zA-Z0-9]+)(?!\s*\?)/g,
        '(theme.fonts && theme.fonts.$1 ? theme.fonts.$1 : {fontFamily: "System", fontWeight: "normal"})'
      );
      
      // Pattern 2: Dynamic access to theme.fonts[X]
      // Replace theme.fonts[X] with (theme.fonts && theme.fonts[X] ? theme.fonts[X] : defaultFont)
      content = content.replace(
        /theme\.fonts\[([^\]]+)\](?!\s*\?)/g,
        '(theme.fonts && theme.fonts[$1] ? theme.fonts[$1] : {fontFamily: "System", fontWeight: "normal"})'
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed unsafe theme access in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to create a themeHelper.js file
function createThemeHelper() {
  const helperCode = `
/**
 * Theme Helper
 * 
 * This helper provides safe access to theme properties.
 */

// Default font configuration
const defaultFont = {
  fontFamily: 'System',
  fontWeight: 'normal',
  fontSize: 14,
};

// Safe access to theme.fonts
export const getFont = (theme, variant) => {
  if (!theme || !theme.fonts || !theme.fonts[variant]) {
    return defaultFont;
  }
  return theme.fonts[variant];
};

// Safe access to theme.colors
export const getColor = (theme, color) => {
  if (!theme || !theme.colors || !theme.colors[color]) {
    return '#000000';
  }
  return theme.colors[color];
};

// Safe access to any theme property with a default value
export const getThemeValue = (theme, path, defaultValue) => {
  if (!theme) return defaultValue;
  
  const parts = path.split('.');
  let value = theme;
  
  for (const part of parts) {
    if (!value || typeof value !== 'object') {
      return defaultValue;
    }
    value = value[part];
  }
  
  return value !== undefined ? value : defaultValue;
};
`;

  const helperPath = path.join(srcDir, 'theme', 'themeHelper.js');
  
  try {
    fs.writeFileSync(helperPath, helperCode);
    console.log(`Created theme helper at ${path.relative(__dirname, helperPath)}`);
    return true;
  } catch (error) {
    console.error(`Error creating theme helper:`, error);
    return false;
  }
}

// Function to patch the Text component in react-native-paper
function patchTextComponent() {
  // Path to the Text.js file in node_modules
  const textComponentPath = path.join(
    __dirname, 
    'node_modules', 
    'react-native-paper', 
    'lib', 
    'module', 
    'components', 
    'Typography', 
    'Text.js'
  );
  
  try {
    if (fs.existsSync(textComponentPath)) {
      console.log('Found Text.js component, applying fixes...');
      
      // Read the file content
      let content = fs.readFileSync(textComponentPath, 'utf8');
      
      // Fix 1: Safe access to theme.fonts[variant]
      content = content.replace(
        'let font = theme.fonts[variant];',
        'let font = theme.fonts && theme.fonts[variant] ? theme.fonts[variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 2: Safe access to theme.fonts[props.variant]
      content = content.replace(
        'font = theme.fonts[props.variant];',
        'font = theme.fonts && theme.fonts[props.variant] ? theme.fonts[props.variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 3: Safe access to Object.keys(theme.fonts)
      content = content.replace(
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${Object.keys(theme.fonts).join(\', \')}.`);',
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${theme.fonts ? Object.keys(theme.fonts).join(\', \') : "none"}.`);'
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPath, content);
      console.log('Successfully patched Text.js component for theme.fonts safety');
      return true;
    } else {
      console.error('Text.js component not found at path:', textComponentPath);
      return false;
    }
  } catch (error) {
    console.error('Error patching Text.js component:', error);
    return false;
  }
}

// Also patch the commonjs version
function patchTextComponentCommonjs() {
  const textComponentPathCommonjs = path.join(
    __dirname, 
    'node_modules', 
    'react-native-paper', 
    'lib', 
    'commonjs', 
    'components', 
    'Typography', 
    'Text.js'
  );
  
  try {
    if (fs.existsSync(textComponentPathCommonjs)) {
      console.log('Found commonjs Text.js component, applying fixes...');
      
      // Read the file content
      let content = fs.readFileSync(textComponentPathCommonjs, 'utf8');
      
      // Fix 1: Safe access to theme.fonts[variant]
      content = content.replace(
        'let font = theme.fonts[variant];',
        'let font = theme.fonts && theme.fonts[variant] ? theme.fonts[variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 2: Safe access to theme.fonts[props.variant]
      content = content.replace(
        'font = theme.fonts[props.variant];',
        'font = theme.fonts && theme.fonts[props.variant] ? theme.fonts[props.variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 3: Safe access to Object.keys(theme.fonts)
      content = content.replace(
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${Object.keys(theme.fonts).join(\', \')}.`);',
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${theme.fonts ? Object.keys(theme.fonts).join(\', \') : "none"}.`);'
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPathCommonjs, content);
      console.log('Successfully patched commonjs Text.js component for theme.fonts safety');
      return true;
    } else {
      console.error('Commonjs Text.js component not found at path:', textComponentPathCommonjs);
      return false;
    }
  } catch (error) {
    console.error('Error patching commonjs Text.js component:', error);
    return false;
  }
}

// Main function
function main() {
  console.log('=== Fix Theme Access Script ===');
  
  try {
    const files = getAllJsFiles(srcDir);
    let fixCount = 0;
    
    // Create theme helper
    createThemeHelper();
    
    // Patch Text component
    patchTextComponent();
    patchTextComponentCommonjs();
    
    // Fix unsafe theme access in all files
    files.forEach(file => {
      if (fixUnsafeThemeAccess(file)) {
        fixCount++;
      }
    });
    
    console.log('\n=== Fix Summary ===');
    console.log(`Fixed unsafe theme access in ${fixCount} files`);
    console.log('Created theme helper for safe theme access');
    console.log('Patched Text component in react-native-paper');
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Run the script
main();