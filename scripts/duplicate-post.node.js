const fs = require('fs');
const path = require('path');

const siteName = process.argv[2];
const sourceSlug = process.argv[3];
const targetSlug = process.argv[4];

if (!siteName || !sourceSlug || !targetSlug) {
    console.error('Usage: node scripts/duplicate-post.node.js <siteName> <sourceSlug> <targetSlug>');
    console.error('Example: node scripts/duplicate-post.node.js pdcyes pdcyes-march-2026 pdcyes-april-2026');
    process.exit(1);
}

const postsDir = path.join(process.cwd(), 'public/content', siteName, 'post');
const sourcePath = path.join(postsDir, `${sourceSlug}.html`);
const targetPath = path.join(postsDir, `${targetSlug}.html`);

if (!fs.existsSync(sourcePath)) {
    console.error(`Source post not found: ${sourcePath}`);
    process.exit(1);
}

if (fs.existsSync(targetPath)) {
    console.error(`Target post already exists: ${targetPath}`);
    process.exit(1);
}

let content = fs.readFileSync(sourcePath, 'utf8');

// 1. Update Title and Meta Tags
content = content.replace(/<title>(.*?)<\/title>/i, (match, p1) => {
    return `<title>${p1.replace(/March/g, 'April').replace(/march/g, 'april')}</title>`;
});

content = content.replace(/<meta name="title" content="(.*?)">/i, (match, p1) => {
    return `<meta name="title" content="${p1.replace(/March/g, 'April').replace(/march/g, 'april')}">`;
});

content = content.replace(/<meta property="og:title" content="(.*?)">/i, (match, p1) => {
    return `<meta property="og:title" content="${p1.replace(/March/g, 'April').replace(/march/g, 'april')}">`;
});

// 2. Update Canonical Link
content = content.replace(/<link rel="canonical" href="(.*?)">/i, (match, p1) => {
    return `<link rel="canonical" href="${p1.replace(sourceSlug, targetSlug)}">`;
});

// 3. Update Social Images (if they include the month name)
content = content.replace(/content="(.*?)March(.*?)"/gi, (match, p1, p2) => {
    return `content="${p1}April${p2}"`;
});

// 4. Update Header Images (if they include the month name)
content = content.replace(/src="(.*?)March(.*?)"/gi, (match, p1, p2) => {
    return `src="${p1}April${p2}"`;
});
content = content.replace(/srcset="(.*?)March(.*?)"/gi, (match, p1, p2) => {
    return `srcset="${p1}April${p2}"`;
});

// 5. Update H1 and Text content
// This is a naive replace for high-level textual changes
content = content.replace(/March 2026/g, 'April 2026');
content = content.replace(/1st March/g, '5th April'); // Assuming first Sunday of April 2026

fs.writeFileSync(targetPath, content);
console.log(`Successfully duplicated post to: ${targetPath}`);
console.log('You can now open this file to edit the content.');
