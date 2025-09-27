#!/bin/bash

# Fix Android build issues
echo "Fixing Android build issues..."

# Create fix-barcode-scanner.js
cat > fix-barcode-scanner.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Disable the barcode scanner module temporarily
function disableBarcodeScannerInAppJson() {
  const appJsonPath = path.join(__dirname, 'app.json');
  
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (appJson.expo && appJson.expo.plugins) {
      // Filter out the barcode scanner plugin if it exists
      appJson.expo.plugins = appJson.expo.plugins.filter(plugin => {
        if (typeof plugin === 'string') {
          return plugin !== 'expo-barcode-scanner';
        } else if (typeof plugin === 'object' && plugin.length >= 1) {
          return plugin[0] !== 'expo-barcode-scanner';
        }
        return true;
      });
    }
    
    // Add a comment in app.json to explain the change
    fs.writeFileSync(
      appJsonPath,
      JSON.stringify(appJson, null, 2) + 
      '\n// Barcode scanner temporarily disabled due to compatibility issues with Expo SDK 54\n'
    );
    console.log('Disabled barcode scanner in app.json');
  } else {
    console.error('app.json not found');
  }
}

// Remove barcode scanner from package.json dependencies
function removeBarcodeScannerFromPackageJson() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies['expo-barcode-scanner']) {
      delete packageJson.dependencies['expo-barcode-scanner'];
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Removed expo-barcode-scanner from package.json');
    } else {
      console.log('expo-barcode-scanner not found in package.json dependencies');
    }
  } else {
    console.error('package.json not found');
  }
}

// Create a stub for the barcode scanner module
function createBarcodeScannerStub() {
  const stubDir = path.join(__dirname, 'src', 'stubs');
  const stubPath = path.join(stubDir, 'BarcodeScannerStub.js');
  
  if (!fs.existsSync(stubDir)) {
    fs.mkdirSync(stubDir, { recursive: true });
  }
  
  const stubContent = `
// This is a stub for the barcode scanner module
// Created due to compatibility issues with Expo SDK 54
export default {
  BarCodeScanner: {
    Constants: {
      Type: {
        qr: 'qr',
        aztec: 'aztec',
        codabar: 'codabar',
        code39: 'code39',
        code93: 'code93',
        code128: 'code128',
        code39mod43: 'code39mod43',
        datamatrix: 'datamatrix',
        ean13: 'ean13',
        ean8: 'ean8',
        interleaved2of5: 'interleaved2of5',
        itf14: 'itf14',
        maxicode: 'maxicode',
        pdf417: 'pdf417',
        rss14: 'rss14',
        rssexpanded: 'rssexpanded',
        upc_a: 'upc_a',
        upc_e: 'upc_e',
        upc_ean: 'upc_ean',
      },
    },
  },
  scanFromURLAsync: async () => {
    console.warn('Barcode scanner is disabled due to compatibility issues with Expo SDK 54');
    return [];
  },
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  getPermissionsAsync: async () => ({ status: 'granted' }),
};
`;

  fs.writeFileSync(stubPath, stubContent);
  console.log(`Created barcode scanner stub at ${stubPath}`);
  
  return stubPath;
}

// Find and update imports of expo-barcode-scanner
function updateBarcodeScannerImports() {
  const srcDir = path.join(__dirname, 'src');
  const stubPath = './stubs/BarcodeScannerStub';
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Replace imports
        content = content.replace(
          /import.*from ['"]expo-barcode-scanner['"]/g,
          `import BarCodeScanner from '${stubPath}'`
        );
        
        // Replace require statements
        content = content.replace(
          /const.*require\(['"]expo-barcode-scanner['"]\)/g,
          `const BarCodeScanner = require('${stubPath}')`
        );
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          console.log(`Updated barcode scanner imports in ${filePath}`);
        }
      }
    }
  }
  
  if (fs.existsSync(srcDir)) {
    processDirectory(srcDir);
  } else {
    console.error('src directory not found');
  }
}

// Run all fixes
function applyAllFixes() {
  console.log('Applying fixes for barcode scanner compatibility issues...');
  disableBarcodeScannerInAppJson();
  removeBarcodeScannerFromPackageJson();
  createBarcodeScannerStub();
  updateBarcodeScannerImports();
  console.log('All fixes applied. Please run "npm install" and then restart your build.');
}

applyAllFixes();
EOL

# Create fix-kotlin-daemon.js
cat > fix-kotlin-daemon.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Add Kotlin daemon configuration to gradle.properties
function fixKotlinDaemon() {
  const gradlePropsPath = path.join(__dirname, 'android', 'gradle.properties');
  
  if (fs.existsSync(gradlePropsPath)) {
    let content = fs.readFileSync(gradlePropsPath, 'utf8');
    
    // Add Kotlin daemon settings if they don't exist
    if (!content.includes('kotlin.daemon.jvm.options')) {
      content += '\n\n# Kotlin daemon settings to prevent timeouts\n';
      content += 'kotlin.daemon.jvm.options=-Xmx2048m\n';
      content += 'kotlin.daemon.jvmargs=-Xmx2048m\n';
      content += 'org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=4096m -XX:+HeapDumpOnOutOfMemoryError\n';
      content += 'org.gradle.daemon=true\n';
      content += 'org.gradle.parallel=true\n';
      content += 'org.gradle.configureondemand=true\n';
      
      fs.writeFileSync(gradlePropsPath, content);
      console.log('Added Kotlin daemon settings to gradle.properties');
    } else {
      console.log('Kotlin daemon settings already exist in gradle.properties');
    }
  } else {
    console.error('gradle.properties not found');
  }
}

fixKotlinDaemon();
EOL

# Create web-config.js
cat > web-config.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Create a web-only configuration
function createWebConfig() {
  const appJsonPath = path.join(__dirname, 'app.json');
  
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Create a backup of the original app.json
    fs.writeFileSync(
      path.join(__dirname, 'app.json.backup'),
      JSON.stringify(appJson, null, 2)
    );
    
    // Modify for web-only
    if (appJson.expo) {
      // Disable problematic native modules
      const disabledModules = [
        'expo-barcode-scanner',
        'expo-image-loader'
      ];
      
      if (appJson.expo.plugins) {
        appJson.expo.plugins = appJson.expo.plugins.filter(plugin => {
          if (typeof plugin === 'string') {
            return !disabledModules.includes(plugin);
          } else if (typeof plugin === 'object' && plugin.length >= 1) {
            return !disabledModules.includes(plugin[0]);
          }
          return true;
        });
      }
      
      // Add web-specific configuration
      if (!appJson.expo.web) {
        appJson.expo.web = {};
      }
      
      appJson.expo.web.favicon = './assets/favicon.png';
      
      // Write the modified app.json
      fs.writeFileSync(
        appJsonPath,
        JSON.stringify(appJson, null, 2) + 
        '\n// Modified for web-only deployment\n'
      );
      
      console.log('Created web-only configuration in app.json');
    }
  } else {
    console.error('app.json not found');
  }
}

createWebConfig();
EOL

# Run the barcode scanner fix
echo "Fixing barcode scanner compatibility issues..."
node fix-barcode-scanner.js

# Run the Kotlin daemon fix
echo "Fixing Kotlin daemon issues..."
node fix-kotlin-daemon.js

# Clean the Android build
echo "Cleaning Android build..."
cd android && ./gradlew clean && cd ..

echo "All fixes applied. You can now run 'npm run web' for web development or try 'npx react-native run-android' again."
echo "If you still encounter issues with Android, run 'node web-config.js' to create a web-only configuration."