const fs = require('fs');
const path = require('path');

// Path to the Text.js file in node_modules
const textComponentPath = path.join(
  __dirname, 
  'node_modules', 
  'react-native-paper', 
  'lib', 
  'module', 
  'components', 
  'Typography', 
  'Text.js'
);

// Function to check if the file exists and patch it
function patchTextComponent() {
  try {
    if (fs.existsSync(textComponentPath)) {
      console.log('Found Text.js component, applying fix...');
      
      // Read the file content
      const content = fs.readFileSync(textComponentPath, 'utf8');
      
      // Create a patched version that handles theme.fonts safely
      const patchedContent = content.replace(
        'let font = theme.fonts[variant];',
        'let font = theme.fonts && theme.fonts[variant] ? theme.fonts[variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPath, patchedContent);
      console.log('Successfully patched Text.js component for theme.fonts safety');
    } else {
      console.error('Text.js component not found at path:', textComponentPath);
    }
  } catch (error) {
    console.error('Error patching Text.js component:', error);
  }
}

// Also patch the commonjs version
const textComponentPathCommonjs = path.join(
  __dirname, 
  'node_modules', 
  'react-native-paper', 
  'lib', 
  'commonjs', 
  'components', 
  'Typography', 
  'Text.js'
);

function patchTextComponentCommonjs() {
  try {
    if (fs.existsSync(textComponentPathCommonjs)) {
      console.log('Found commonjs Text.js component, applying fix...');
      
      // Read the file content
      const content = fs.readFileSync(textComponentPathCommonjs, 'utf8');
      
      // Create a patched version that handles theme.fonts safely
      const patchedContent = content.replace(
        'let font = theme.fonts[variant];',
        'let font = theme.fonts && theme.fonts[variant] ? theme.fonts[variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPathCommonjs, patchedContent);
      console.log('Successfully patched commonjs Text.js component for theme.fonts safety');
    } else {
      console.error('Commonjs Text.js component not found at path:', textComponentPathCommonjs);
    }
  } catch (error) {
    console.error('Error patching commonjs Text.js component:', error);
  }
}

// Execute the patches
patchTextComponent();
patchTextComponentCommonjs();