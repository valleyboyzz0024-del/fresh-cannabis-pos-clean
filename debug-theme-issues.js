/**
 * Theme Debugging Script
 * 
 * This script helps identify and fix theme-related issues in the React Native application.
 * It focuses on:
 * 1. Validating the theme structure
 * 2. Finding missing font variants
 * 3. Fixing theme access patterns
 */

const fs = require('fs');
const path = require('path');

// Configuration
const themeFilePath = path.join(__dirname, 'src', 'theme', 'theme.js');
const screensDir = path.join(__dirname, 'src', 'screens');
const componentsDir = path.join(__dirname, 'src', 'components');

// Required font variants based on React Native Paper
const requiredFontVariants = [
  'regular', 'medium', 'light', 'thin', 'bold',
  'bodySmall', 'bodyMedium', 'bodyLarge',
  'titleSmall', 'titleMedium', 'titleLarge',
  'labelSmall', 'labelMedium', 'labelLarge',
  'headlineSmall', 'headlineMedium', 'headlineLarge',
  'displaySmall', 'displayMedium', 'displayLarge'
];

// Function to read and parse the theme file
function readThemeFile() {
  try {
    const themeContent = fs.readFileSync(themeFilePath, 'utf8');
    console.log('Theme file found and read successfully.');
    return themeContent;
  } catch (error) {
    console.error('Error reading theme file:', error);
    return null;
  }
}

// Function to check if the theme has all required font variants
function checkFontVariants(themeContent) {
  console.log('\n--- Checking Font Variants ---');
  
  const missingVariants = [];
  
  requiredFontVariants.forEach(variant => {
    if (!themeContent.includes(`${variant}: {`)) {
      missingVariants.push(variant);
    }
  });
  
  if (missingVariants.length === 0) {
    console.log('✅ All required font variants are present in the theme.');
  } else {
    console.log('❌ Missing font variants:', missingVariants.join(', '));
    
    // Generate code to add missing variants
    console.log('\nAdd the following code to your theme.js file:');
    console.log('fonts: {');
    console.log('  // Existing font definitions...');
    
    missingVariants.forEach(variant => {
      console.log(`  ${variant}: {`);
      console.log('    fontFamily: \'System\',');
      console.log('    fontWeight: \'normal\',');
      console.log('    fontSize: 14,');
      console.log('  },');
    });
    
    console.log('},');
  }
  
  return missingVariants;
}

// Function to find all font variant usages in the codebase
function findFontVariantUsages() {
  console.log('\n--- Finding Font Variant Usages ---');
  
  const usages = {};
  
  // Function to process a directory
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Look for variant="..." patterns
        const variantRegex = /variant=["']([^"']+)["']/g;
        let match;
        
        while ((match = variantRegex.exec(content)) !== null) {
          const variant = match[1];
          
          if (!usages[variant]) {
            usages[variant] = [];
          }
          
          usages[variant].push(filePath);
        }
        
        // Look for theme.fonts.X patterns
        const themeRegex = /theme\.fonts\.([a-zA-Z0-9]+)/g;
        
        while ((match = themeRegex.exec(content)) !== null) {
          const variant = match[1];
          
          if (!usages[variant]) {
            usages[variant] = [];
          }
          
          usages[variant].push(filePath);
        }
      }
    });
  }
  
  // Process screens and components directories
  if (fs.existsSync(screensDir)) {
    processDirectory(screensDir);
  }
  
  if (fs.existsSync(componentsDir)) {
    processDirectory(componentsDir);
  }
  
  console.log('Font variant usages found:');
  Object.keys(usages).forEach(variant => {
    console.log(`- ${variant}: ${usages[variant].length} occurrences`);
  });
  
  return usages;
}

// Function to check for unsafe theme access patterns
function checkUnsafeThemeAccess() {
  console.log('\n--- Checking for Unsafe Theme Access ---');
  
  const unsafePatterns = [
    { regex: /theme\.fonts\[[^\]]+\]/g, description: 'Unsafe dynamic access to theme.fonts' },
    { regex: /theme\.fonts\.([a-zA-Z0-9]+)(?!\s*\?)/g, description: 'Direct access to theme.fonts without null check' }
  ];
  
  const issues = [];
  
  // Function to process a directory
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        unsafePatterns.forEach(pattern => {
          if (pattern.regex.test(content)) {
            issues.push({
              file: filePath,
              description: pattern.description
            });
          }
        });
      }
    });
  }
  
  // Process screens and components directories
  if (fs.existsSync(screensDir)) {
    processDirectory(screensDir);
  }
  
  if (fs.existsSync(componentsDir)) {
    processDirectory(componentsDir);
  }
  
  if (issues.length === 0) {
    console.log('✅ No unsafe theme access patterns found.');
  } else {
    console.log(`❌ Found ${issues.length} potential unsafe theme access patterns:`);
    issues.forEach(issue => {
      console.log(`- ${issue.file}: ${issue.description}`);
    });
  }
  
  return issues;
}

// Function to create a safe theme access helper
function createSafeThemeHelper() {
  console.log('\n--- Creating Safe Theme Helper ---');
  
  const helperCode = `
/**
 * Safe Theme Helper
 * 
 * This helper provides safe access to theme properties.
 */

// Safe access to theme.fonts
export const getFont = (theme, variant) => {
  if (!theme || !theme.fonts || !theme.fonts[variant]) {
    // Return default font configuration
    return {
      fontFamily: 'System',
      fontWeight: 'normal',
      fontSize: 14,
    };
  }
  
  return theme.fonts[variant];
};

// Safe access to theme.colors
export const getColor = (theme, color) => {
  if (!theme || !theme.colors || !theme.colors[color]) {
    // Return default color
    return '#000000';
  }
  
  return theme.colors[color];
};

// Safe access to any theme property with a default value
export const getThemeValue = (theme, path, defaultValue) => {
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

  const helperPath = path.join(__dirname, 'src', 'theme', 'themeHelper.js');
  
  try {
    fs.writeFileSync(helperPath, helperCode);
    console.log(`✅ Safe theme helper created at ${helperPath}`);
    console.log('Use this helper to safely access theme properties:');
    console.log('import { getFont, getColor, getThemeValue } from \'../theme/themeHelper\';');
    console.log('const font = getFont(theme, \'bodyMedium\');');
  } catch (error) {
    console.error('Error creating safe theme helper:', error);
  }
}

// Main function
function main() {
  console.log('=== Theme Debugging Script ===');
  
  const themeContent = readThemeFile();
  
  if (!themeContent) {
    console.error('Cannot proceed without theme file.');
    return;
  }
  
  const missingVariants = checkFontVariants(themeContent);
  const usages = findFontVariantUsages();
  const issues = checkUnsafeThemeAccess();
  
  if (missingVariants.length > 0 || issues.length > 0) {
    createSafeThemeHelper();
  }
  
  console.log('\n=== Theme Debugging Complete ===');
}

// Run the script
main();