/**
 * Complete Theme Fix Script
 * 
 * This script ensures the theme.js file has all required properties and
 * fixes any issues that could cause "Cannot read property 'X' of undefined" errors.
 */

const fs = require('fs');
const path = require('path');

// Path to the theme.js file
const themePath = path.join(__dirname, 'src', 'theme', 'theme.js');

// Function to read the theme file
function readThemeFile() {
  try {
    const content = fs.readFileSync(themePath, 'utf8');
    console.log('Theme file read successfully');
    return content;
  } catch (error) {
    console.error('Error reading theme file:', error);
    return null;
  }
}

// Function to ensure the theme has all required properties
function fixThemeFile(content) {
  if (!content) return null;
  
  console.log('Fixing theme file...');
  
  // Make sure theme has fonts object
  if (!content.includes('fonts:')) {
    console.log('Adding fonts object to theme');
    content = content.replace(
      'export const theme = {',
      `export const theme = {
  // Added fonts object
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
    bodySmall: {
      fontFamily: 'System',
      fontWeight: 'normal',
      fontSize: 12,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontWeight: 'normal',
      fontSize: 14,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontWeight: 'normal',
      fontSize: 16,
    },
  },`
    );
  } else {
    // Check if fonts object has all required variants
    const requiredVariants = ['regular', 'medium', 'light', 'thin', 'bold', 'bodySmall', 'bodyMedium', 'bodyLarge'];
    
    requiredVariants.forEach(variant => {
      if (!content.includes(`${variant}: {`)) {
        console.log(`Adding ${variant} variant to fonts object`);
        
        // Find the end of the fonts object
        const fontsMatch = content.match(/fonts:\s*{([^}]*)}/s);
        
        if (fontsMatch) {
          const fontsContent = fontsMatch[1];
          const newFontsContent = fontsContent + `
    ${variant}: {
      fontFamily: 'System',
      fontWeight: ${variant === 'bold' ? "'bold'" : variant === 'medium' ? "'500'" : "'normal'"},
      fontSize: ${variant.includes('Small') ? 12 : variant.includes('Large') ? 16 : 14},
    },`;
          
          content = content.replace(
            /fonts:\s*{([^}]*)}/s,
            `fonts: {${newFontsContent}}`
          );
        }
      }
    });
  }
  
  // Make sure theme has sizes object
  if (!content.includes('sizes:')) {
    console.log('Adding sizes object to theme');
    content = content.replace(
      'export const theme = {',
      `export const theme = {
  // Added sizes object
  sizes: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },`
    );
  }
  
  // Make sure theme has fontVariant property
  if (!content.includes('fontVariant:')) {
    console.log('Adding fontVariant property to theme');
    content = content.replace(
      'export const theme = {',
      `export const theme = {
  // Added fontVariant property
  fontVariant: 'regular',`
    );
  }
  
  // Fix any syntax errors in the theme file
  content = fixSyntaxErrors(content);
  
  return content;
}

// Function to fix common syntax errors in the theme file
function fixSyntaxErrors(content) {
  // Fix missing commas between properties
  content = content.replace(/}(\s*)\n(\s*)[a-zA-Z]/g, '},\n$2');
  
  // Fix extra commas at the end of objects
  content = content.replace(/,(\s*)\}/g, '\n}');
  
  // Fix duplicate closing brackets
  content = content.replace(/}(\s*)\n(\s*)};/g, '}\n};');
  
  return content;
}

// Function to write the fixed theme file
function writeThemeFile(content) {
  try {
    // Create a backup of the original file
    fs.copyFileSync(themePath, themePath + '.bak');
    console.log('Created backup of original theme file');
    
    // Write the fixed content
    fs.writeFileSync(themePath, content);
    console.log('Theme file fixed and saved successfully');
    return true;
  } catch (error) {
    console.error('Error writing theme file:', error);
    return false;
  }
}

// Main function
function main() {
  console.log('=== Complete Theme Fix Script ===');
  
  const content = readThemeFile();
  if (!content) {
    console.error('Cannot proceed without theme file');
    return;
  }
  
  const fixedContent = fixThemeFile(content);
  if (!fixedContent) {
    console.error('Failed to fix theme file');
    return;
  }
  
  const success = writeThemeFile(fixedContent);
  if (success) {
    console.log('Theme file has been fixed successfully');
  } else {
    console.error('Failed to write fixed theme file');
  }
}

// Run the script
main();