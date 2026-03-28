const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'public');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  // Group by basename to find duplicates
  const groups = {};
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      const base = path.basename(file, ext);
      
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        if (!groups[base]) groups[base] = [];
        groups[base].push({ file, fullPath, ext, size: stat.size });
      }
    }
  });

  // Process groups
  for (const base in groups) {
    const group = groups[base];
    if (group.length > 1) {
      const webp = group.find(f => f.ext === '.webp');
      if (webp) {
        // We have a WebP and something else. Delete the originals.
        group.forEach(f => {
          if (f.ext !== '.webp') {
            try {
              fs.unlinkSync(f.fullPath);
              console.log(`Deleted original: ${path.relative(process.cwd(), f.fullPath)}`);
            } catch (err) {
              console.error(`Error deleting ${f.file}:`, err.message);
            }
          }
        });
      }
    }
  }
}

try {
  console.log('Starting duplicate cleanup...');
  processDir(targetDir);
  console.log('Cleanup finished.');
} catch (err) {
  console.error('Cleanup failed:', err);
}
