const fs = require('fs');
const path = require('path');

// Path to the useHeaderConfigProps.js file in node_modules
const headerConfigPath = path.join(
  __dirname, 
  'node_modules', 
  '@react-navigation', 
  'native-stack', 
  'lib', 
  'module', 
  'views', 
  'useHeaderConfigProps.js'
);

// Read our fixed version
const fixedHeaderConfigPath = path.join(
  __dirname,
  'src',
  'fixes',
  'useHeaderConfigProps.js'
);

try {
  // Check if the files exist
  if (fs.existsSync(headerConfigPath) && fs.existsSync(fixedHeaderConfigPath)) {
    // Read the fixed version
    const fixedContent = fs.readFileSync(fixedHeaderConfigPath, 'utf8');
    
    // Write the fixed content to the node_modules file
    fs.writeFileSync(headerConfigPath, fixedContent);
    console.log('Successfully patched useHeaderConfigProps.js');
  } else {
    if (!fs.existsSync(headerConfigPath)) {
      console.error('useHeaderConfigProps.js not found at path:', headerConfigPath);
    }
    if (!fs.existsSync(fixedHeaderConfigPath)) {
      console.error('Fixed useHeaderConfigProps.js not found at path:', fixedHeaderConfigPath);
    }
  }
} catch (error) {
  console.error('Error patching useHeaderConfigProps.js:', error);
}