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
    } else if (path.extname(file) === '.js' || path.extname(file) === '.jsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix pointerEvents props in a file
function fixPointerEventsProps(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses pointerEvents as a prop
    const hasPointerEventsProp = /pointerEvents=/.test(content);
    
    if (hasPointerEventsProp) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);
      
      // Replace pointerEvents prop with style.pointerEvents
      content = content.replace(
        /pointerEvents=["']([^"']*)["']/g, 
        'style={{...style, pointerEvents: "$1"}}'
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

// Function to fix useNativeDriver in a file
function fixUseNativeDriver(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses useNativeDriver
    const hasUseNativeDriver = /useNativeDriver:\s*true/.test(content);
    
    if (hasUseNativeDriver) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);
      
      // Check if Platform is imported
      const hasPlatformImport = /import.*Platform.*from\s+['"]react-native['"]/.test(content);
      
      // Add Platform import if needed
      if (!hasPlatformImport) {
        content = content.replace(
          /import\s+{([^}]*)}\s+from\s+['"]react-native['"]/,
          'import {$1, Platform} from \'react-native\''
        );
        
        // If there's no import with curly braces, add a new import line
        if (!content.includes('Platform') && content.includes('react-native')) {
          content = content.replace(
            /import\s+([^{]*)\s+from\s+['"]react-native['"]/,
            'import $1, {Platform} from \'react-native\''
          );
        }
        
        // If still no Platform import, add it at the top
        if (!content.includes('Platform')) {
          content = 'import { Platform } from \'react-native\';\n' + content;
        }
      }
      
      // Replace useNativeDriver: true with platform-specific condition
      content = content.replace(
        /useNativeDriver:\s*true/g,
        'useNativeDriver: Platform.OS !== \'web\''
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed useNativeDriver in ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to fix TouchableWithoutFeedback in a file
function fixTouchableWithoutFeedback(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses TouchableWithoutFeedback
    const hasTouchableWithoutFeedback = /TouchableWithoutFeedback/.test(content);
    
    if (hasTouchableWithoutFeedback) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);
      
      // Replace TouchableWithoutFeedback import with Pressable
      content = content.replace(
        /import\s+{([^}]*)TouchableWithoutFeedback([^}]*)}\s+from\s+['"]react-native['"]/,
        'import {$1Pressable$2} from \'react-native\''
      );
      
      // Replace TouchableWithoutFeedback usage with Pressable
      content = content.replace(/TouchableWithoutFeedback/g, 'Pressable');
      
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

// Process all JS files in the src directory
function processFiles() {
  try {
    const srcDir = path.join(__dirname, 'src');
    const files = getAllJsFiles(srcDir);
    let pointerEventsFixCount = 0;
    let shadowPropsFixCount = 0;
    let useNativeDriverFixCount = 0;
    let touchableWithoutFeedbackFixCount = 0;
    
    files.forEach(file => {
      if (fixPointerEventsProps(file)) {
        pointerEventsFixCount++;
      }
      if (fixShadowProps(file)) {
        shadowPropsFixCount++;
      }
      if (fixUseNativeDriver(file)) {
        useNativeDriverFixCount++;
      }
      if (fixTouchableWithoutFeedback(file)) {
        touchableWithoutFeedbackFixCount++;
      }
    });
    
    console.log(`\nSummary:`);
    console.log(`- Fixed pointerEvents props in ${pointerEventsFixCount} files`);
    console.log(`- Fixed shadow props in ${shadowPropsFixCount} files`);
    console.log(`- Fixed useNativeDriver in ${useNativeDriverFixCount} files`);
    console.log(`- Fixed TouchableWithoutFeedback in ${touchableWithoutFeedbackFixCount} files`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Execute the function
processFiles();