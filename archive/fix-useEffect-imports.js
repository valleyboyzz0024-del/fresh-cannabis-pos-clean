const fs = require('fs');
const path = require('path');

// Directory containing screen files
const screensDir = path.join(__dirname, 'src', 'screens');

// Function to check if a file uses useEffect but doesn't import it
function fixUseEffectImport(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses useEffect
    const usesUseEffect = content.includes('useEffect(');
    
    // Check if the file already imports useEffect
    const importsUseEffect = /import React,.*useEffect.*from 'react'/.test(content);
    
    if (usesUseEffect && !importsUseEffect) {
      console.log(`Fixing useEffect import in ${path.basename(filePath)}`);
      
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
      console.log(`Fixed useEffect import in ${path.basename(filePath)}`);
      return true;
    } else if (usesUseEffect && importsUseEffect) {
      console.log(`${path.basename(filePath)} already has correct useEffect import`);
    } else if (!usesUseEffect) {
      console.log(`${path.basename(filePath)} doesn't use useEffect, no fix needed`);
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
    const files = fs.readdirSync(screensDir);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (path.extname(file) === '.js') {
        const filePath = path.join(screensDir, file);
        if (fixUseEffectImport(filePath)) {
          fixedCount++;
        }
      }
    });
    
    console.log(`\nSummary: Fixed useEffect imports in ${fixedCount} files`);
  } catch (error) {
    console.error('Error processing screen files:', error);
  }
}

// Execute the function
processScreenFiles();