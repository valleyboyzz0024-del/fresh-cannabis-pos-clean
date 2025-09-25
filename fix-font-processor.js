const fs = require('fs');
const path = require('path');

// Path to the FontProcessor.js file in node_modules
const fontProcessorPath = path.join(
  __dirname, 
  'node_modules', 
  '@react-navigation', 
  'native-stack', 
  'lib', 
  'module', 
  'views', 
  'FontProcessor.js'
);

// New content for the FontProcessor.js file
const newContent = `"use strict";

export function processFonts(fontFamilies) {
  // Simply return the font families as is, without processing
  return fontFamilies || [];
}
//# sourceMappingURL=FontProcessor.js.map
`;

try {
  // Check if the file exists
  if (fs.existsSync(fontProcessorPath)) {
    // Write the new content to the file
    fs.writeFileSync(fontProcessorPath, newContent);
    console.log('Successfully patched FontProcessor.js');
  } else {
    console.error('FontProcessor.js not found at path:', fontProcessorPath);
  }
} catch (error) {
  console.error('Error patching FontProcessor.js:', error);
}