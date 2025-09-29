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

// Function to fix useEffect imports in a file
function fixUseEffectImport(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses useEffect
    const usesUseEffect = content.includes('useEffect(');
    
    // Check if the file already imports useEffect
    const importsUseEffect = /import React,.*useEffect.*from 'react'/.test(content);
    
    if (usesUseEffect && !importsUseEffect) {
      console.log(`Fixing useEffect import in ${path.relative(__dirname, filePath)}`);
      
      // Replace the React import to include useEffect
      content = content.replace(
        /import React,\s*{([^}]*)}\s*from\s*'react'/,
        (match, imports) => {
          // Check if useState is already imported
          if (imports.includes('useState')) {
            return `import React, {${imports}, useEffect} from 'react'`;
          } else {
            return `import React, {${imports} useEffect} from 'react'`;
          }
        }
      );
      
      // If there's no destructuring in the import, add it
      if (!/import React,\s*{/.test(content)) {
        content = content.replace(
          /import React from 'react'/,
          `import React, { useEffect } from 'react'`
        );
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Fixed useEffect import in ${path.relative(__dirname, filePath)}`);
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
      console.log(`Fixing shadow props in ${path.relative(__dirname, filePath)}`);
      
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
    const hasPointerEventsProp = /pointerEvents=/.test(content);
    
    if (hasPointerEventsProp) {
      console.log(`Fixing pointerEvents props in ${path.relative(__dirname, filePath)}`);
      
      // Replace pointerEvents prop with style.pointerEvents
      content = content.replace(
        /pointerEvents=["']([^"']*)["']/g, 
        'style={{pointerEvents: "$1"}}'
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
function processAllFiles() {
  try {
    const srcDir = path.join(__dirname, 'src');
    const files = getAllJsFiles(srcDir);
    let useEffectFixCount = 0;
    let shadowPropsFixCount = 0;
    let pointerEventsFixCount = 0;
    
    files.forEach(file => {
      if (fixUseEffectImport(file)) {
        useEffectFixCount++;
      }
      if (fixShadowProps(file)) {
        shadowPropsFixCount++;
      }
      if (fixPointerEventsProps(file)) {
        pointerEventsFixCount++;
      }
    });
    
    console.log(`\nSummary:`);
    console.log(`- Fixed useEffect imports in ${useEffectFixCount} files`);
    console.log(`- Fixed shadow props in ${shadowPropsFixCount} files`);
    console.log(`- Fixed pointerEvents props in ${pointerEventsFixCount} files`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Execute the function
processAllFiles();