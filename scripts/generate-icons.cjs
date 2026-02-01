/**
 * Icon Generation Script (CommonJS version)
 * 
 * Generates PNG icons from the SVG.
 * Run: node scripts/generate-icons.cjs
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.resolve(__dirname, '../public/icons');
const SIZES = [16, 32, 48, 128];

async function generateIcons() {
  const svgPath = path.resolve(ICONS_DIR, 'icon.svg');
  
  if (!fs.existsSync(svgPath)) {
    console.error('SVG file not found:', svgPath);
    process.exit(1);
  }
  
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of SIZES) {
    const outputPath = path.resolve(ICONS_DIR, `icon${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
