const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(process.cwd(), 'public');

async function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await processDir(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      const base = path.basename(file, ext);
      
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const webpPath = path.join(dir, base + '.webp');
        
        if (!fs.existsSync(webpPath)) {
          console.log(`Converting to WebP: ${path.relative(process.cwd(), fullPath)}`);
          try {
            await sharp(fullPath)
              .toFormat('webp')
              .toFile(webpPath);
            console.log(`  Success. Deleting original.`);
            fs.unlinkSync(fullPath);
          } catch (err) {
            console.error(`  Failed to convert ${file}:`, err.message);
          }
        }
      }
    }
  }
}

async function main() {
  try {
    console.log('Starting remaining image conversion...');
    await processDir(targetDir);
    console.log('Conversion finished.');
  } catch (err) {
    console.error('Conversion failed:', err);
  }
}

main();
