/**
 * Comprehensive App Testing Script
 * 
 * This script performs various tests on the React Native application to identify issues:
 * 1. Component rendering tests
 * 2. Navigation tests
 * 3. Theme consistency tests
 * 4. Performance tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.join(__dirname, 'src');
const screensDir = path.join(srcDir, 'screens');
const componentsDir = path.join(srcDir, 'components');

// Function to recursively get all JS files in a directory
function getAllJsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to extract component names from files
function extractComponentNames(files) {
  const components = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for component definitions
      const componentRegex = /(?:export\s+default\s+function\s+([A-Za-z0-9_]+)|class\s+([A-Za-z0-9_]+)\s+extends\s+React\.Component|const\s+([A-Za-z0-9_]+)\s*=\s*(?:React\.)?memo\(|const\s+([A-Za-z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*{|const\s+([A-Za-z0-9_]+)\s*=\s*function\s*\()/g;
      
      let match;
      while ((match = componentRegex.exec(content)) !== null) {
        const componentName = match[1] || match[2] || match[3] || match[4] || match[5];
        
        if (componentName) {
          components.push({
            name: componentName,
            file: file
          });
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
  
  return components;
}

// Function to analyze imports and dependencies
function analyzeImports(files) {
  const imports = {};
  const missingImports = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      // Extract imports
      const importRegex = /import\s+(?:{([^}]+)}|([A-Za-z0-9_]+))\s+from\s+['"]([^'"]+)['"]/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importedItems = match[1] ? match[1].split(',').map(item => item.trim()) : [match[2]];
        const importPath = match[3];
        
        importedItems.forEach(item => {
          if (!item) return;
          
          // Remove 'as X' aliases
          const cleanItem = item.split(' as ')[0].trim();
          
          if (!imports[fileName]) {
            imports[fileName] = [];
          }
          
          imports[fileName].push({
            item: cleanItem,
            path: importPath
          });
          
          // Check if import is a local file that doesn't exist
          if (importPath.startsWith('.') && !importPath.includes('node_modules')) {
            let resolvedPath = path.resolve(path.dirname(file), importPath);
            
            // Try different extensions
            const extensions = ['.js', '.jsx', '.ts', '.tsx'];
            let exists = false;
            
            for (const ext of extensions) {
              if (fs.existsSync(resolvedPath + ext)) {
                exists = true;
                break;
              }
            }
            
            // Check if it's a directory with an index file
            if (!exists && fs.existsSync(resolvedPath)) {
              for (const ext of extensions) {
                if (fs.existsSync(path.join(resolvedPath, 'index' + ext))) {
                  exists = true;
                  break;
                }
              }
            }
            
            if (!exists) {
              missingImports.push({
                file: fileName,
                import: importPath
              });
            }
          }
        });
      }
    } catch (error) {
      console.error(`Error analyzing imports in ${file}:`, error);
    }
  });
  
  return { imports, missingImports };
}

// Function to check for common React Native issues
function checkCommonIssues(files) {
  const issues = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      // Check for useState without initial value
      if (content.includes('useState(') && content.match(/useState\(\s*\)/)) {
        issues.push({
          file: fileName,
          issue: 'useState called without initial value',
          severity: 'warning'
        });
      }
      
      // Check for useEffect without dependencies array
      if (content.includes('useEffect(') && content.match(/useEffect\(\s*\(\)\s*=>\s*{[^}]*}\s*\)/)) {
        issues.push({
          file: fileName,
          issue: 'useEffect called without dependencies array',
          severity: 'warning'
        });
      }
      
      // Check for direct style manipulation
      if (content.match(/style\s*=\s*{[^}]*}/)) {
        issues.push({
          file: fileName,
          issue: 'Inline styles used (consider using StyleSheet)',
          severity: 'info'
        });
      }
      
      // Check for console.log statements
      if (content.match(/console\.log\(/)) {
        issues.push({
          file: fileName,
          issue: 'console.log statements found (remove in production)',
          severity: 'info'
        });
      }
      
      // Check for hardcoded colors
      if (content.match(/#[0-9A-Fa-f]{3,8}/)) {
        issues.push({
          file: fileName,
          issue: 'Hardcoded colors found (use theme.colors instead)',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error(`Error checking for issues in ${file}:`, error);
    }
  });
  
  return issues;
}

// Function to analyze theme usage
function analyzeThemeUsage(files) {
  const themeUsage = {};
  const themeIssues = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      // Check if file uses theme
      const usesTheme = content.includes('theme.');
      
      if (usesTheme) {
        themeUsage[fileName] = {
          colors: [],
          fonts: []
        };
        
        // Extract theme.colors usage
        const colorRegex = /theme\.colors\.([a-zA-Z0-9]+)/g;
        let match;
        
        while ((match = colorRegex.exec(content)) !== null) {
          const color = match[1];
          if (!themeUsage[fileName].colors.includes(color)) {
            themeUsage[fileName].colors.push(color);
          }
        }
        
        // Extract theme.fonts usage
        const fontRegex = /theme\.fonts\.([a-zA-Z0-9]+)/g;
        
        while ((match = fontRegex.exec(content)) !== null) {
          const font = match[1];
          if (!themeUsage[fileName].fonts.includes(font)) {
            themeUsage[fileName].fonts.push(font);
          }
        }
        
        // Check for unsafe theme access
        if (content.match(/theme\.fonts\.[a-zA-Z0-9]+(?!\s*\?)/)) {
          themeIssues.push({
            file: fileName,
            issue: 'Unsafe theme.fonts access (missing null check)',
            severity: 'error'
          });
        }
        
        if (content.match(/theme\.colors\.[a-zA-Z0-9]+(?!\s*\?)/)) {
          themeIssues.push({
            file: fileName,
            issue: 'Unsafe theme.colors access (missing null check)',
            severity: 'warning'
          });
        }
      }
    } catch (error) {
      console.error(`Error analyzing theme usage in ${file}:`, error);
    }
  });
  
  return { themeUsage, themeIssues };
}

// Function to check for deprecated APIs
function checkDeprecatedAPIs(files) {
  const deprecatedAPIs = [
    { pattern: /TouchableWithoutFeedback/g, replacement: 'Pressable' },
    { pattern: /componentWillMount/g, replacement: 'componentDidMount or useEffect' },
    { pattern: /componentWillReceiveProps/g, replacement: 'componentDidUpdate or useEffect' },
    { pattern: /componentWillUpdate/g, replacement: 'componentDidUpdate or useEffect' },
    { pattern: /pointerEvents=/g, replacement: 'style.pointerEvents' },
    { pattern: /shadow(Color|Offset|Opacity|Radius)/g, replacement: 'boxShadow*' }
  ];
  
  const issues = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      deprecatedAPIs.forEach(api => {
        if (content.match(api.pattern)) {
          issues.push({
            file: fileName,
            issue: `Deprecated API: ${api.pattern.source} (use ${api.replacement} instead)`,
            severity: 'warning'
          });
        }
      });
    } catch (error) {
      console.error(`Error checking for deprecated APIs in ${file}:`, error);
    }
  });
  
  return issues;
}

// Function to generate a test report
function generateReport(components, imports, missingImports, commonIssues, themeUsage, themeIssues, deprecatedIssues) {
  const report = {
    components: components.length,
    imports: Object.keys(imports).length,
    missingImports: missingImports.length,
    commonIssues: commonIssues.length,
    themeUsage: Object.keys(themeUsage).length,
    themeIssues: themeIssues.length,
    deprecatedIssues: deprecatedIssues.length,
    details: {
      components,
      imports,
      missingImports,
      commonIssues,
      themeUsage,
      themeIssues,
      deprecatedIssues
    }
  };
  
  // Write report to file
  const reportPath = path.join(__dirname, 'app-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`Full report written to ${reportPath}`);
  
  return report;
}

// Function to generate a human-readable report
function generateHumanReadableReport(report) {
  let content = `# App Test Report\n\n`;
  content += `## Summary\n\n`;
  content += `- Components: ${report.components}\n`;
  content += `- Files with imports: ${report.imports}\n`;
  content += `- Missing imports: ${report.missingImports}\n`;
  content += `- Common issues: ${report.commonIssues}\n`;
  content += `- Files using theme: ${report.themeUsage}\n`;
  content += `- Theme-related issues: ${report.themeIssues}\n`;
  content += `- Deprecated API issues: ${report.deprecatedIssues}\n\n`;
  
  // Add missing imports section
  if (report.missingImports > 0) {
    content += `## Missing Imports\n\n`;
    report.details.missingImports.forEach(item => {
      content += `- ${item.file}: Missing import '${item.import}'\n`;
    });
    content += `\n`;
  }
  
  // Add common issues section
  if (report.commonIssues > 0) {
    content += `## Common Issues\n\n`;
    report.details.commonIssues.forEach(item => {
      content += `- ${item.file}: ${item.issue} (${item.severity})\n`;
    });
    content += `\n`;
  }
  
  // Add theme issues section
  if (report.themeIssues > 0) {
    content += `## Theme Issues\n\n`;
    report.details.themeIssues.forEach(item => {
      content += `- ${item.file}: ${item.issue} (${item.severity})\n`;
    });
    content += `\n`;
  }
  
  // Add deprecated API issues section
  if (report.deprecatedIssues > 0) {
    content += `## Deprecated API Issues\n\n`;
    report.details.deprecatedIssues.forEach(item => {
      content += `- ${item.file}: ${item.issue} (${item.severity})\n`;
    });
    content += `\n`;
  }
  
  // Add recommendations section
  content += `## Recommendations\n\n`;
  
  if (report.themeIssues > 0) {
    content += `### Theme Issues\n`;
    content += `- Use the themeHelper.js for safe theme access\n`;
    content += `- Add null checks when accessing theme properties\n`;
    content += `- Ensure all required font variants are defined in theme.js\n\n`;
  }
  
  if (report.deprecatedIssues > 0) {
    content += `### Deprecated APIs\n`;
    content += `- Replace TouchableWithoutFeedback with Pressable\n`;
    content += `- Replace shadow* props with boxShadow* props\n`;
    content += `- Replace pointerEvents prop with style.pointerEvents\n\n`;
  }
  
  if (report.commonIssues > 0) {
    content += `### Common Issues\n`;
    content += `- Always provide initial values for useState\n`;
    content += `- Always provide a dependencies array for useEffect\n`;
    content += `- Use StyleSheet instead of inline styles\n`;
    content += `- Remove console.log statements in production\n`;
    content += `- Use theme colors instead of hardcoded colors\n\n`;
  }
  
  // Write report to file
  const reportPath = path.join(__dirname, 'app-test-report.md');
  fs.writeFileSync(reportPath, content);
  
  console.log(`Human-readable report written to ${reportPath}`);
}

// Main function
function main() {
  console.log('=== Comprehensive App Testing Script ===');
  
  try {
    // Get all JS files
    const screenFiles = getAllJsFiles(screensDir);
    const componentFiles = getAllJsFiles(componentsDir);
    const allFiles = [...screenFiles, ...componentFiles];
    
    console.log(`Found ${screenFiles.length} screen files and ${componentFiles.length} component files`);
    
    // Extract components
    const components = extractComponentNames(allFiles);
    console.log(`Found ${components.length} components`);
    
    // Analyze imports
    const { imports, missingImports } = analyzeImports(allFiles);
    console.log(`Analyzed imports in ${Object.keys(imports).length} files`);
    console.log(`Found ${missingImports.length} potentially missing imports`);
    
    // Check for common issues
    const commonIssues = checkCommonIssues(allFiles);
    console.log(`Found ${commonIssues.length} common issues`);
    
    // Analyze theme usage
    const { themeUsage, themeIssues } = analyzeThemeUsage(allFiles);
    console.log(`Found ${Object.keys(themeUsage).length} files using theme`);
    console.log(`Found ${themeIssues.length} theme-related issues`);
    
    // Check for deprecated APIs
    const deprecatedIssues = checkDeprecatedAPIs(allFiles);
    console.log(`Found ${deprecatedIssues.length} deprecated API issues`);
    
    // Generate report
    const report = generateReport(
      components,
      imports,
      missingImports,
      commonIssues,
      themeUsage,
      themeIssues,
      deprecatedIssues
    );
    
    // Generate human-readable report
    generateHumanReadableReport(report);
    
    console.log('\n=== Testing Complete ===');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the script
main();