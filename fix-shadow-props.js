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

// Process all JS files in the src directory
function processFiles() {
  try {
    const srcDir = path.join(__dirname, 'src');
    const files = getAllJsFiles(srcDir);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (fixShadowProps(file)) {
        fixedCount++;
      }
    });
    
    console.log(`\nSummary: Fixed shadow props in ${fixedCount} files`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Execute the function
processFiles();