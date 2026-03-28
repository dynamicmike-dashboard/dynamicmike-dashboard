const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'public', 'content');

function getAllFiles(dir, allFiles) {
  const files = fs.readdirSync(dir);
  allFiles = allFiles || [];
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, allFiles);
    } else {
      allFiles.push({ path: fullPath, mtime: stat.mtime });
    }
  });
  
  return allFiles;
}

try {
  const allFiles = getAllFiles(targetDir);
  allFiles.sort((a, b) => b.mtime - a.mtime);
  
  console.log('5 most recently modified files in public/content:');
  allFiles.slice(0, 5).forEach(f => {
    console.log(`${f.mtime}: ${path.relative(process.cwd(), f.path)}`);
  });
} catch (err) {
  console.error('Failed to list files:', err);
}
