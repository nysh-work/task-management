const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Source image should be at least 512x512
const SOURCE_ICON = path.join(process.cwd(), 'public', 'app-icon.png');

// Icon sizes needed for PWA
const SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Check if source icon exists
    if (!fs.existsSync(SOURCE_ICON)) {
      console.error('Source icon not found. Please add app-icon.png to the public directory.');
      process.exit(1);
    }

    // Generate icons for each size
    for (const size of SIZES) {
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }

    // Generate Safari pinned tab icon (SVG)
    await sharp(SOURCE_ICON)
      .resize(512, 512)
      .toFile(path.join(ICONS_DIR, 'safari-pinned-tab.svg'));
    
    console.log('Generated Safari pinned tab icon');
    console.log('\nAll icons generated successfully!');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 