const fs = require('fs');
const path = require('path');

// Function to recursively get all JS files in a directory
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (path.extname(file) === '.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to check for deprecated props in a file
function checkDeprecatedProps(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(__dirname, filePath);
    let issues = [];
    
    // Check for pointerEvents prop
    if (/pointerEvents=/.test(content)) {
      issues.push(`pointerEvents prop found in ${relPath}`);
    }
    
    // Check for shadow* props
    if (/shadowColor|shadowOffset|shadowOpacity|shadowRadius/.test(content)) {
      issues.push(`shadow* props found in ${relPath}`);
    }
    
    // Check for useNativeDriver: true without platform check
    if (/useNativeDriver:\s*true/.test(content)) {
      issues.push(`useNativeDriver: true found without platform check in ${relPath}`);
    }
    
    // Check for TouchableWithoutFeedback
    if (/TouchableWithoutFeedback/.test(content)) {
      issues.push(`TouchableWithoutFeedback found in ${relPath}`);
    }
    
    return issues;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [`Error processing ${path.relative(__dirname, filePath)}: ${error.message}`];
  }
}

// Process all JS files in the src directory
function testFixesInFiles() {
  try {
    const srcDir = path.join(__dirname, 'src');
    const files = getAllJsFiles(srcDir);
    let allIssues = [];
    
    files.forEach(file => {
      const issues = checkDeprecatedProps(file);
      if (issues.length > 0) {
        allIssues = [...allIssues, ...issues];
      }
    });
    
    if (allIssues.length === 0) {
      console.log('\n✅ All deprecation issues have been fixed successfully!');
    } else {
      console.log('\n⚠️ Some deprecation issues still remain:');
      allIssues.forEach(issue => {
        console.log(`- ${issue}`);
      });
    }
    
    // Write results to a file
    const resultContent = allIssues.length === 0 
      ? '# Deprecation Fixes Test Results\n\n✅ All deprecation issues have been fixed successfully!'
      : '# Deprecation Fixes Test Results\n\n⚠️ Some deprecation issues still remain:\n\n' + 
        allIssues.map(issue => `- ${issue}`).join('\n');
    
    fs.writeFileSync(path.join(__dirname, 'deprecation-test-results.md'), resultContent);
    console.log('\nTest results saved to deprecation-test-results.md');
    
    return allIssues.length === 0;
  } catch (error) {
    console.error('Error testing fixes:', error);
    return false;
  }
}

// Execute the function
testFixesInFiles();