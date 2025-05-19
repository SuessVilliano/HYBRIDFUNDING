import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories
const outputDir = './logo-files';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Convert SVG to PNG and JPG
async function convertSvgToImages(svgPath, basename) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Convert to PNG (various sizes)
    await sharp(Buffer.from(svgContent))
      .resize(200, 60)
      .png()
      .toFile(path.join(outputDir, `${basename}.png`));
    
    await sharp(Buffer.from(svgContent))
      .resize(400, 120)
      .png()
      .toFile(path.join(outputDir, `${basename}@2x.png`));
    
    // Convert to JPG
    await sharp(Buffer.from(svgContent))
      .resize(200, 60)
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, `${basename}.jpg`));
      
    await sharp(Buffer.from(svgContent))
      .resize(400, 120)
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, `${basename}@2x.jpg`));
      
    // Copy the SVG file
    fs.copyFileSync(svgPath, path.join(outputDir, `${basename}.svg`));
    
    console.log(`Successfully generated all formats for ${basename}`);
  } catch (error) {
    console.error(`Error converting ${svgPath}:`, error);
  }
}

// Process the full logo
convertSvgToImages('./client/src/assets/hybrid-funding-logo.svg', 'hybrid-funding-logo');

// Process the icon logo
convertSvgToImages('./client/src/assets/hybrid-funding-logo-icon.svg', 'hybrid-funding-logo-icon')
  .then(() => {
    console.log('All logo files have been generated in the logo-files directory');
  });