const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'public');

function getAllFiles(dir, allFiles) {
  const files = fs.readdirSync(dir);
  allFiles = allFiles || [];
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, allFiles);
    } else {
      allFiles.push({ path: fullPath, size: stat.size });
    }
  });
  
  return allFiles;
}

try {
  const allFiles = getAllFiles(targetDir);
  allFiles.sort((a, b) => b.size - a.size);
  
  console.log('Top 20 largest files in public/:');
  allFiles.slice(0, 20).forEach(f => {
    console.log(`${Math.round(f.size / 1024 / 1024, 2)} MB: ${path.relative(process.cwd(), f.path)}`);
  });
} catch (err) {
  console.error('Failed to list files:', err);
}
