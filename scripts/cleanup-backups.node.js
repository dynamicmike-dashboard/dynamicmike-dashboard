const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'public', 'content');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else {
      // Look for files like "about-us (2).html"
      if (file.match(/\s\(\d+\)\.html$/)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted backup: ${path.relative(process.cwd(), fullPath)}`);
        } catch (err) {
          console.error(`Error deleting ${file}:`, err.message);
        }
      }
    }
  });
}

try {
  console.log('Starting HTML backup cleanup...');
  processDir(targetDir);
  console.log('Cleanup finished.');
} catch (err) {
  console.error('Cleanup failed:', err);
}
