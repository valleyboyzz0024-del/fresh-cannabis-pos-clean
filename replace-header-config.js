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

// Content for the stub
const stubContent = `"use strict";

// Dead-end stub for useHeaderConfigProps
export function useHeaderConfigProps() {
  return { headerShown: false };
}
//# sourceMappingURL=useHeaderConfigProps.js.map
`;

try {
  // Check if the file exists
  if (fs.existsSync(headerConfigPath)) {
    // Write the stub content to the file
    fs.writeFileSync(headerConfigPath, stubContent);
    console.log('Successfully replaced useHeaderConfigProps.js with stub');
  } else {
    console.error('useHeaderConfigProps.js not found at path:', headerConfigPath);
  }
} catch (error) {
  console.error('Error replacing useHeaderConfigProps.js:', error);
}