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

// Process all JS files in the src directory
function processFiles() {
  try {
    const srcDir = path.join(__dirname, 'src');
    const files = getAllJsFiles(srcDir);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (fixPointerEventsProps(file)) {
        fixedCount++;
      }
    });
    
    console.log(`\nSummary: Fixed pointerEvents props in ${fixedCount} files`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Execute the function
processFiles();