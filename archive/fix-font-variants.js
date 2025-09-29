const fs = require('fs');
const path = require('path');

// Path to the theme.js file
const themePath = path.join(__dirname, 'src', 'theme', 'theme.js');

// Function to update the theme.js file with missing font variants
function addMissingFontVariants() {
  try {
    // Read the theme.js file
    let content = fs.readFileSync(themePath, 'utf8');
    
    // Check if the file already has the font variants
    if (content.includes('bodySmall:')) {
      console.log('Font variants already added to theme.js');
      return false;
    }
    
    // Find the fonts object in the theme.js file
    const fontsRegex = /fonts:\s*{([^}]*)}/s;
    const match = content.match(fontsRegex);
    
    if (!match) {
      console.error('Could not find fonts object in theme.js');
      return false;
    }
    
    // Current fonts object content
    const currentFonts = match[1];
    
    // New fonts object with additional variants
    const newFonts = `fonts: {
      // Basic variants
      regular: {
        fontFamily: 'System',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      light: {
        fontFamily: 'System',
        fontWeight: '300',
      },
      thin: {
        fontFamily: 'System',
        fontWeight: '100',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: 'bold',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900',
      },
      
      // Body variants
      bodySmall: {
        fontFamily: 'System',
        fontWeight: 'normal',
        fontSize: 12,
      },
      bodyMedium: {
        fontFamily: 'System',
        fontWeight: 'normal',
        fontSize: 14,
      },
      bodyLarge: {
        fontFamily: 'System',
        fontWeight: 'normal',
        fontSize: 16,
      },
      
      // Title variants
      titleSmall: {
        fontFamily: 'System',
        fontWeight: '500',
        fontSize: 14,
      },
      titleMedium: {
        fontFamily: 'System',
        fontWeight: '500',
        fontSize: 16,
      },
      titleLarge: {
        fontFamily: 'System',
        fontWeight: '500',
        fontSize: 20,
      },
      
      // Label variants
      labelSmall: {
        fontFamily: 'System',
        fontWeight: '500',
        fontSize: 10,
      },
      labelMedium: {
        fontFamily: 'System',
        fontWeight: '500',
        fontSize: 12,
      },
      labelLarge: {
        fontFamily: 'System',
        fontWeight: '500',
        fontSize: 14,
      },
      
      // Heading variants
      headlineSmall: {
        fontFamily: 'System',
        fontWeight: 'bold',
        fontSize: 24,
      },
      headlineMedium: {
        fontFamily: 'System',
        fontWeight: 'bold',
        fontSize: 28,
      },
      headlineLarge: {
        fontFamily: 'System',
        fontWeight: 'bold',
        fontSize: 32,
      },
      
      // Display variants
      displaySmall: {
        fontFamily: 'System',
        fontWeight: 'bold',
        fontSize: 36,
      },
      displayMedium: {
        fontFamily: 'System',
        fontWeight: 'bold',
        fontSize: 45,
      },
      displayLarge: {
        fontFamily: 'System',
        fontWeight: 'bold',
        fontSize: 57,
      },
    }`;
    
    // Replace the fonts object in the theme.js file
    content = content.replace(fontsRegex, newFonts);
    
    // Write the updated content back to the file
    fs.writeFileSync(themePath, content);
    
    console.log('Successfully added missing font variants to theme.js');
    return true;
  } catch (error) {
    console.error('Error updating theme.js:', error);
    return false;
  }
}

// Execute the function
addMissingFontVariants();