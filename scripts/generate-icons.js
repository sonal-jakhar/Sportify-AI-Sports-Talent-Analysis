/**
 * generate-icons.js
 * Script to generate PWA icons from SVG source
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Requirements:
 * - sharp package: npm install sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('Error: sharp package is required.');
  console.error('Please install it by running: npm install sharp');
  console.error('');
  console.error('Alternatively, you can:');
  console.error('1. Use an online tool like https://realfavicongenerator.net/');
  console.error('2. Use ImageMagick: convert -resize 192x192 public/icon.svg public/icon-192.png');
  console.error('3. Use any image editor to export PNG from public/icon.svg');
  process.exit(1);
}

const svgPath = path.resolve(__dirname, '../public/icon.svg');
const outputDir = path.resolve(__dirname, '../public');

// Sizes required for PWA
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];

async function generateIcons() {
  try {
    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error(`Error: SVG file not found at ${svgPath}`);
      process.exit(1);
    }

    console.log('Generating PWA icons...\n');

    // Generate each size
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 22, g: 163, b: 74, alpha: 1 } // #16a34a (Sportify Green)
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log('\n✨ All icons generated successfully!');
    console.log(`Icons saved to: ${outputDir}`);
    
  } catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
