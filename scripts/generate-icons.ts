/**
 * Icon Generation Script
 * 
 * This script generates PNG icons from the SVG.
 * Run: npm run generate-icons
 * 
 * NOTE: Requires 'sharp' package: npm install -D sharp
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = resolve(__dirname, '../public/icons');
const SIZES = [16, 32, 48, 128];

async function generateIcons() {
  const svgBuffer = readFileSync(resolve(ICONS_DIR, 'icon.svg'));

  for (const size of SIZES) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(resolve(ICONS_DIR, `icon${size}.png`));

    console.log(`Generated icon${size}.png`);
  }

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
