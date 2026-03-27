const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CONTENT_DIR = path.resolve(__dirname, '../public/content');

async function convertDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await convertDir(fullPath);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                const webpPath = fullPath.replace(ext, '.webp');
                
                if (fs.existsSync(webpPath)) {
                    // console.log(`Skipping ${entry.name}, .webp already exists.`);
                    continue;
                }

                try {
                    await sharp(fullPath)
                        .webp({ quality: 80 })
                        .toFile(webpPath);
                    
                    const oldSize = fs.statSync(fullPath).size;
                    const newSize = fs.statSync(webpPath).size;
                    console.log(`Converted: ${entry.name} (${(oldSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB)`);
                    
                    // Optional: Update HTML files to point to the new webp?
                    // That's a separate step for safety.
                } catch (err) {
                    console.error(`Error converting ${entry.name}:`, err.message);
                }
            }
        }
    }
}

async function updateHTMLFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await updateHTMLFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Match image src/srcset with .png, .jpg, .jpeg
            const regex = /src=["'](.*?\.(png|jpg|jpeg))["']|srcset=["'](.*?\.(png|jpg|jpeg))["']/gi;
            
            content = content.replace(regex, (match, p1, p2, p3, p4) => {
                const imgSource = p1 || p3;
                const ext = p2 || p4;
                const webpSource = imgSource.replace(`.${ext}`, '.webp');
                
                // Construct absolute-ish path for existence check
                // This assumes paths are either local or relative to the site content
                const localPath = path.join(path.dirname(fullPath), webpSource.split('?')[0]);
                
                if (fs.existsSync(localPath)) {
                    // console.log(`  Updating ${imgSource} -> ${webpSource} in ${entry.name}`);
                    return match.replace(`.${ext}`, '.webp');
                }
                return match;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated HTML: ${entry.name}`);
            }
        }
    }
}

async function main() {
    console.log("Starting WebP Conversion...");
    await convertDir(CONTENT_DIR);
    console.log("Updating HTML references...");
    await updateHTMLFiles(CONTENT_DIR);
    console.log("Optimization complete!");
}

main().catch(err => console.error(err));
