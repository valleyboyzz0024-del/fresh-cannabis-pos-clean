const fs = require('fs');
const path = require('path');

// Function to recursively get all JS files in a directory
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (path.extname(file) === '.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix useNativeDriver warnings in a file
function fixUseNativeDriverWarnings(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses Animated and useNativeDriver
    const usesAnimated = content.includes('Animated.');
    const usesUseNativeDriver = content.includes('useNativeDriver');
    
    if (usesAnimated && !usesUseNativeDriver) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);
      
      // Add conditional useNativeDriver based on platform
      content = content.replace(
        /Animated\.timing\(\s*([^,]+),\s*{\s*toValue:\s*([^,]+),\s*duration:\s*([^}]+)\s*}\s*\)/g,
        'Animated.timing($1, { toValue: $2, duration: $3, useNativeDriver: Platform.OS !== "web" })'
      );
      
      // Add Platform import if not already present
      if (!content.includes('import { Platform }') && !content.includes('import Platform')) {
        if (content.includes('import { ') && content.includes('from \'react-native\'')) {
          content = content.replace(
            /import {([^}]*)} from ['"]react-native['"]/,
            'import {$1, Platform} from \'react-native\''
          );
        } else if (content.includes('import') && content.includes('from \'react-native\'')) {
          content = content.replace(
            /import ([^{]*) from ['"]react-native['"]/,
            'import $1, { Platform } from \'react-native\''
          );
        } else {
          // Add new import statement at the top of the file
          content = 'import { Platform } from \'react-native\';\n' + content;
        }
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed useNativeDriver warnings in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    
    // If the file already uses useNativeDriver, check if it's set correctly
    if (usesAnimated && usesUseNativeDriver) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);
      
      // Replace useNativeDriver: true with platform-specific condition
      content = content.replace(
        /useNativeDriver:\s*true/g,
        'useNativeDriver: Platform.OS !== "web"'
      );
      
      // Add Platform import if not already present
      if (!content.includes('import { Platform }') && !content.includes('import Platform')) {
        if (content.includes('import { ') && content.includes('from \'react-native\'')) {
          content = content.replace(
            /import {([^}]*)} from ['"]react-native['"]/,
            'import {$1, Platform} from \'react-native\''
          );
        } else if (content.includes('import') && content.includes('from \'react-native\'')) {
          content = content.replace(
            /import ([^{]*) from ['"]react-native['"]/,
            'import $1, { Platform } from \'react-native\''
          );
        } else {
          // Add new import statement at the top of the file
          content = 'import { Platform } from \'react-native\';\n' + content;
        }
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed useNativeDriver warnings in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Process all JS files in the src directory
function processFiles() {
  try {
    const srcDir = path.join(__dirname, 'src');
    const files = getAllJsFiles(srcDir);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (fixUseNativeDriverWarnings(file)) {
        fixedCount++;
      }
    });
    
    console.log(`\nSummary: Fixed useNativeDriver warnings in ${fixedCount} files`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Execute the function
processFiles();