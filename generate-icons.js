const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Paths
const SOURCE_LOGO = path.join(__dirname, 'assets', 'new', 'cannaflow-logo.png');
const ASSETS_DIR = path.join(__dirname, 'assets');

// Icon sizes
const ICON_SIZES = {
  icon: 1024,
  adaptiveIcon: 1024,
  favicon: 192,
  splash: 1024
};

// Background color
const BG_COLOR = '#121212';

// Function to create a square canvas with the logo centered
async function createIcon(sourcePath, outputPath, size, padding = 0.2, backgroundColor = BG_COLOR) {
  try {
    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // Load source image
    const image = await loadImage(sourcePath);
    
    // Calculate dimensions to maintain aspect ratio
    const aspectRatio = image.width / image.height;
    let drawWidth, drawHeight;
    
    if (aspectRatio > 1) {
      // Image is wider than tall
      drawWidth = size * (1 - padding * 2);
      drawHeight = drawWidth / aspectRatio;
    } else {
      // Image is taller than wide or square
      drawHeight = size * (1 - padding * 2);
      drawWidth = drawHeight * aspectRatio;
    }
    
    // Calculate position to center the image
    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;
    
    // Draw the image
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Created ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error);
    return false;
  }
}

// Function to create a splash screen with logo and tagline
async function createSplash(sourcePath, outputPath, size, backgroundColor = BG_COLOR) {
  try {
    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // Load source image
    const image = await loadImage(sourcePath);
    
    // Calculate dimensions to maintain aspect ratio
    const aspectRatio = image.width / image.height;
    let drawWidth, drawHeight;
    
    // Make the logo take up about 60% of the height
    drawHeight = size * 0.6;
    drawWidth = drawHeight * aspectRatio;
    
    // Calculate position to center the image
    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2 - size * 0.05; // Shift up slightly
    
    // Draw the image
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    
    // Add tagline
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${size * 0.04}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Seamless from seed to sale', size / 2, y + drawHeight + size * 0.1);
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Created ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error);
    return false;
  }
}

// Main function to generate all icons
async function generateIcons() {
  console.log('Generating app icons from logo...');
  
  try {
    // Check if source logo exists
    if (!fs.existsSync(SOURCE_LOGO)) {
      console.error(`Source logo not found: ${SOURCE_LOGO}`);
      return false;
    }
    
    // Create icon.png
    await createIcon(
      SOURCE_LOGO,
      path.join(ASSETS_DIR, 'icon.png'),
      ICON_SIZES.icon,
      0.2
    );
    
    // Create adaptive-icon.png
    await createIcon(
      SOURCE_LOGO,
      path.join(ASSETS_DIR, 'adaptive-icon.png'),
      ICON_SIZES.adaptiveIcon,
      0.3
    );
    
    // Create favicon.png
    await createIcon(
      SOURCE_LOGO,
      path.join(ASSETS_DIR, 'favicon.png'),
      ICON_SIZES.favicon,
      0.1
    );
    
    // Create splash.png
    await createSplash(
      SOURCE_LOGO,
      path.join(ASSETS_DIR, 'splash.png'),
      ICON_SIZES.splash
    );
    
    console.log('All icons generated successfully!');
    return true;
  } catch (error) {
    console.error('Error generating icons:', error);
    return false;
  }
}

// Run the generator
generateIcons();