const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(process.cwd(), 'public', 'content'),
  path.join(process.cwd(), 'public', 'realai-pages')
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.html')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

try {
  targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = getAllFiles(dir);
    console.log(`Processing ${files.length} HTML files in ${dir}...`);
    
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      
      // Replace variations of src="...", href="...", background: url(...)
      // Look for .png, .jpg, .jpeg followed by a closing quote or parenthesis or space
      content = content.replace(/(\.(png|jpg|jpeg))(?=["' \)])/gi, '.webp');
      
      if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${path.relative(process.cwd(), file)}`);
      }
    });
  });
  console.log('Finished updating HTML files.');
} catch (err) {
  console.error('Error updating HTML:', err);
}
