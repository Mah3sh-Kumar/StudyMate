/**
 * Placeholder Image Generator for StudyMate
 * 
 * This script creates simple placeholder PNG images for development.
 * Run with: node assets/images/create-placeholders.js
 * 
 * Note: Requires 'sharp' package. Install with: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: "sharp" package not found.');
  console.log('📦 Install it with: npm install sharp');
  console.log('   or: pnpm add sharp');
  process.exit(1);
}

const imagesDir = __dirname;

// Color scheme for StudyMate (blue theme)
const primaryColor = '#4A90E2'; // StudyMate blue
const textColor = '#FFFFFF';

// Image configurations
const images = [
  {
    name: 'icon.png',
    size: 1024,
    description: 'Main app icon'
  },
  {
    name: 'adaptive-icon.png',
    size: 1024,
    description: 'Android adaptive icon'
  },
  {
    name: 'favicon.png',
    size: 64,
    description: 'Web favicon'
  },
  {
    name: 'splash-icon.png',
    size: 200,
    description: 'Splash screen icon'
  }
];

async function createPlaceholderImage(config) {
  const { name, size, description } = config;
  const filePath = path.join(imagesDir, name);

  try {
    // Create a simple colored square with "SM" text
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${primaryColor}"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${size * 0.4}" 
          font-weight="bold"
          fill="${textColor}" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >SM</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(filePath);

    console.log(`✅ Created ${name} (${size}x${size}) - ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create ${name}:`, error.message);
    return false;
  }
}

async function createAllPlaceholders() {
  console.log('🎨 Creating placeholder images for StudyMate...\n');

  let successCount = 0;
  for (const image of images) {
    const success = await createPlaceholderImage(image);
    if (success) successCount++;
  }

  console.log(`\n✨ Created ${successCount}/${images.length} placeholder images.`);
  console.log('📝 Note: Replace these with your actual app icons before production!');
}

// Run the script
createAllPlaceholders().catch(console.error);

