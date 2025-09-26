const fs = require('fs');
const path = require('path');

// Function to replace TouchableWithoutFeedback with Pressable in a file
function replaceTouchableWithoutFeedback(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses TouchableWithoutFeedback
    const usesTouchableWithoutFeedback = content.includes('TouchableWithoutFeedback');
    
    if (usesTouchableWithoutFeedback) {
      console.log(`Fixing TouchableWithoutFeedback in ${path.basename(filePath)}`);
      
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
      console.log(`Fixed TouchableWithoutFeedback in ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Process all JS files in the screens directory
function processScreenFiles() {
  try {
    const screensDir = path.join(__dirname, 'src', 'screens');
    const files = fs.readdirSync(screensDir);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (path.extname(file) === '.js') {
        const filePath = path.join(screensDir, file);
        if (replaceTouchableWithoutFeedback(filePath)) {
          fixedCount++;
        }
      }
    });
    
    console.log(`\nSummary: Fixed TouchableWithoutFeedback in ${fixedCount} files`);
  } catch (error) {
    console.error('Error processing screen files:', error);
  }
}

// Execute the function
processScreenFiles();