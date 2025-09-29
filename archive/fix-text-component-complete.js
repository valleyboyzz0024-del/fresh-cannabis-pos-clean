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
      console.log('Found Text.js component, applying fixes...');
      
      // Read the file content
      let content = fs.readFileSync(textComponentPath, 'utf8');
      
      // Fix 1: Safe access to theme.fonts[variant]
      content = content.replace(
        'let font = theme.fonts[variant];',
        'let font = theme.fonts && theme.fonts[variant] ? theme.fonts[variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 2: Safe access to theme.fonts[props.variant]
      content = content.replace(
        'font = theme.fonts[props.variant];',
        'font = theme.fonts && theme.fonts[props.variant] ? theme.fonts[props.variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 3: Safe access to Object.keys(theme.fonts)
      content = content.replace(
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${Object.keys(theme.fonts).join(\', \')}.`);',
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${theme.fonts ? Object.keys(theme.fonts).join(\', \') : "none"}.`);'
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPath, content);
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
      console.log('Found commonjs Text.js component, applying fixes...');
      
      // Read the file content
      let content = fs.readFileSync(textComponentPathCommonjs, 'utf8');
      
      // Fix 1: Safe access to theme.fonts[variant]
      content = content.replace(
        'let font = theme.fonts[variant];',
        'let font = theme.fonts && theme.fonts[variant] ? theme.fonts[variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 2: Safe access to theme.fonts[props.variant]
      content = content.replace(
        'font = theme.fonts[props.variant];',
        'font = theme.fonts && theme.fonts[props.variant] ? theme.fonts[props.variant] : { fontFamily: "System", fontWeight: "normal" };'
      );
      
      // Fix 3: Safe access to Object.keys(theme.fonts)
      content = content.replace(
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${Object.keys(theme.fonts).join(\', \')}.`);',
        'throw new Error(`Variant ${variant} was not provided properly. Valid variants are ${theme.fonts ? Object.keys(theme.fonts).join(\', \') : "none"}.`);'
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPathCommonjs, content);
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

console.log('All patches applied successfully!');