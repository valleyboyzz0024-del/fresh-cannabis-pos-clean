const fs = require('fs');
const path = require('path');

// List of screen files to fix
const screenFiles = [
  'src/screens/CartScreen.js',
  'src/screens/CashFloatScreen.js',
  'src/screens/DashboardScreen.js',
  'src/screens/InventoryScreen.js',
  'src/screens/LoginScreen.js',
  'src/screens/ProductDetailScreen.js',
  'src/screens/SaleDetailScreen.js',
  'src/screens/SalesScreen.js',
  'src/screens/SettingsScreen.js'
];

screenFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove Text from react-native-paper imports
      content = content.replace(/import \{\s*Text,\s*/g, 'import { ');
      content = content.replace(/import \{\s*([^}]*),\s*Text\s*\}/g, 'import { $1 }');
      content = content.replace(/,\s*Text\s*\}/g, ' }');
      content = content.replace(/\{\s*Text\s*,/g, '{ ');
      
      // Add Text to react-native imports
      content = content.replace(
        /(import \{\s*[^}]*)\} from 'react-native';/,
        '$1,\n  Text\n} from \'react-native\';'
      );
      
      // Clean up any duplicate Text imports
      content = content.replace(/Text,\s*Text/g, 'Text');
      content = content.replace(/,\s*,/g, ',');
      content = content.replace(/\{\s*,/g, '{ ');
      content = content.replace(/,\s*\}/g, ' }');
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
});

console.log('Text import fixes complete!');