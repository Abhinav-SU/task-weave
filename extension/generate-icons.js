// Simple icon generator for TaskWeave extension
// Creates placeholder PNG icons using Canvas API (if available) or generates SVG fallbacks

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG icon
function createSVGIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="central" fill="white">📋</text>
</svg>`;
}

// Create simple data URI for PNG (base64 encoded transparent pixel)
// This is a minimal placeholder - users should replace with actual icons
function createPlaceholderPNG() {
  // 1x1 transparent PNG as base64
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

// For now, create SVG files (better than nothing)
console.log('📝 Creating placeholder icon files...\n');

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${svgPath}`);
  
  // Also create a minimal PNG placeholder
  const pngPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(pngPath, createPlaceholderPNG());
  console.log(`✓ Created ${pngPath} (placeholder)`);
});

console.log('\n✅ Icon files created!');
console.log('\n⚠️  Note: The PNG files are minimal placeholders.');
console.log('   For production, replace them with proper icons:');
console.log('   - Use the SVG files as a starting point');
console.log('   - Or open create-icons.html in a browser');
console.log('   - Or use a design tool like Figma/Photoshop\n');

