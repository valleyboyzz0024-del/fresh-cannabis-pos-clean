const fs = require('fs');

// Define the correct imports for each screen
const screenImports = {
  'src/screens/CartScreen.js': {
    reactNative: ['StyleSheet', 'View', 'FlatList', 'Alert', 'ScrollView', 'KeyboardAvoidingView', 'Platform', 'Text'],
    paper: ['Surface', 'Title', 'Button', 'IconButton', 'Divider', 'TextInput', 'ActivityIndicator', 'Portal', 'Dialog', 'List']
  },
  'src/screens/CashFloatScreen.js': {
    reactNative: ['StyleSheet', 'View', 'ScrollView', 'RefreshControl', 'Alert', 'Text'],
    paper: ['Surface', 'Title', 'Button', 'Divider', 'ActivityIndicator', 'TextInput', 'List', 'Portal', 'Dialog', 'Caption']
  },
  'src/screens/DashboardScreen.js': {
    reactNative: ['StyleSheet', 'View', 'ScrollView', 'RefreshControl', 'Text'],
    paper: ['Surface', 'Title', 'Divider', 'ActivityIndicator', 'Button', 'IconButton', 'List']
  },
  'src/screens/InventoryScreen.js': {
    reactNative: ['StyleSheet', 'View', 'FlatList', 'TouchableOpacity', 'RefreshControl', 'Alert', 'Text'],
    paper: ['Surface', 'Title', 'Searchbar', 'Button', 'FAB', 'Chip', 'ActivityIndicator', 'IconButton', 'Portal', 'Dialog', 'TextInput', 'Divider']
  },
  'src/screens/LoginScreen.js': {
    reactNative: ['StyleSheet', 'View', 'Image', 'KeyboardAvoidingView', 'Platform', 'TouchableWithoutFeedback', 'Keyboard', 'StatusBar', 'Dimensions', 'Text'],
    paper: ['TextInput', 'Button', 'Surface', 'ActivityIndicator', 'Title']
  },
  'src/screens/ProductDetailScreen.js': {
    reactNative: ['StyleSheet', 'View', 'ScrollView', 'Alert', 'Text'],
    paper: ['Surface', 'Title', 'Button', 'Divider', 'ActivityIndicator', 'Chip', 'TextInput', 'IconButton']
  },
  'src/screens/SaleDetailScreen.js': {
    reactNative: ['StyleSheet', 'View', 'ScrollView', 'Share', 'Platform', 'Text'],
    paper: ['Surface', 'Title', 'Button', 'Divider', 'ActivityIndicator', 'List', 'IconButton', 'Caption']
  },
  'src/screens/SalesScreen.js': {
    reactNative: ['StyleSheet', 'View', 'FlatList', 'TouchableOpacity', 'RefreshControl', 'Dimensions', 'Platform', 'Alert', 'Text'],
    paper: ['Surface', 'Title', 'Searchbar', 'Button', 'FAB', 'Chip', 'ActivityIndicator', 'IconButton', 'List', 'Divider', 'Portal', 'Dialog']
  },
  'src/screens/SettingsScreen.js': {
    reactNative: ['StyleSheet', 'View', 'ScrollView', 'Alert', 'Linking', 'Text'],
    paper: ['Surface', 'Title', 'Button', 'Divider', 'List', 'Switch', 'Portal', 'Dialog', 'TextInput', 'IconButton']
  }
};

Object.entries(screenImports).forEach(([filePath, imports]) => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Find the end of the imports section
      const importEndIndex = content.indexOf("} from 'react-native-paper';");
      if (importEndIndex === -1) return;
      
      const afterImports = content.substring(importEndIndex + "} from 'react-native-paper';".length);
      
      // Create new import section
      const newImports = `import React, { useState } from 'react';
import { 
  ${imports.reactNative.join(',\n  ')}
} from 'react-native';
import { 
  ${imports.paper.join(',\n  ')}
} from 'react-native-paper';`;
      
      // Reconstruct the file
      const newContent = newImports + afterImports;
      
      fs.writeFileSync(filePath, newContent);
      console.log(`Cleaned imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning ${filePath}:`, error);
  }
});

console.log('Import cleaning complete!');