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
      console.log('Found Text.js component, checking for variant handling...');
      
      // Read the file content
      const content = fs.readFileSync(textComponentPath, 'utf8');
      
      // Check if the file already contains our patch
      if (content.includes('// PATCHED FOR VARIANT SAFETY')) {
        console.log('Text.js already patched, skipping...');
        return;
      }
      
      // Create a patched version that handles missing variants safely
      const patchedContent = content.replace(
        /const { variant = 'bodyMedium', style, theme, .*?\} = props;/s,
        `// PATCHED FOR VARIANT SAFETY
const { variant = 'bodyMedium', style, theme, ...rest } = props;
// Ensure we have a valid variant or default to bodyMedium
const safeVariant = (theme.variants && theme.variants[variant]) ? variant : 'bodyMedium';
// Force theme.fontVariant to be 'regular' if it's not set
if (!theme.fontVariant) {
  theme.fontVariant = 'regular';
}`
      );
      
      // Write the patched content back to the file
      fs.writeFileSync(textComponentPath, patchedContent);
      console.log('Successfully patched Text.js component for variant safety');
    } else {
      console.error('Text.js component not found at path:', textComponentPath);
    }
  } catch (error) {
    console.error('Error patching Text.js component:', error);
  }
}

// Execute the patch
patchTextComponent();