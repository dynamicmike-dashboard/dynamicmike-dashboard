const fs = require('fs');
const path = require('path');

const SITES = [
    {
        name: 'pdcyes',
        postsDir: path.join(process.cwd(), 'public/content/pdcyes/post'),
        indexFile: path.join(process.cwd(), 'public/content/pdcyes/index.html'),
        newsFile: path.join(process.cwd(), 'public/content/pdcyes/news.html'),
        baseUrl: 'https://pdcyes.com'
    },
    {
        name: 'breath-of-life',
        postsDir: path.join(process.cwd(), 'public/content/breath-of-life/post'),
        indexFile: path.join(process.cwd(), 'public/content/breath-of-life/index.html'),
        newsFile: path.join(process.cwd(), 'public/content/breath-of-life/news.html'),
        baseUrl: 'https://breathoflifepdc.org'
    }
];

const ANCHOR_START = '<!-- BLOG_LISTING_START -->';
const ANCHOR_END = '<!-- BLOG_LISTING_END -->';

function extractMetadata(html, filePath, site) {
    const metadata = {
        title: '',
        date: '',
        image: '',
        description: '',
        author: '',
        url: '',
        category: 'Latest News'
    };

    // Extract Title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/<meta name="title" content="(.*?)">/i);
    if (titleMatch) metadata.title = titleMatch[1];

    // Extract Date
    const dateMatch = html.match(/<span class="blog-date">(.*?)<\/span>/i);
    if (dateMatch) metadata.date = dateMatch[1];

    // Extract Image
    const imageMatch = html.match(/<meta name="image" content="(.*?)">/i) || html.match(/<meta property="og:image" content="(.*?)">/i);
    if (imageMatch) metadata.image = imageMatch[1];

    // Extract Description
    const descMatch = html.match(/<meta name="description" content="([\s\S]*?)">/i) || html.match(/<meta property="og:description" content="([\s\S]*?)">/i);
    if (descMatch) metadata.description = descMatch[1].trim().replace(/\n/g, ' ');

    // Extract Author
    const authorMatch = html.match(/<p class="blog-author-name">(.*?)<\/p>/i);
    if (authorMatch) metadata.author = authorMatch[1];

    // Extract Category
    const catMatch = html.match(/<span class="blog-category"><a.*?>(.*?)<\/a><\/span>/i);
    if (catMatch) metadata.category = catMatch[1];

    // Set URL
    const fileName = path.basename(filePath, '.html');
    metadata.url = `${site.baseUrl}/post/${fileName}`;

    return metadata;
}

function generateNewsHtml(posts) {
    return posts.map(post => `
<div class="blog-box">
    <a href="${post.url}">
        <div class="blog-image-standard-wrapper">
            <div class="blog-image-dap blog-image">
                <picture class="hl-image-picture h-100 w-100" style="display:block;">
                    <img src="${post.image}" alt="${post.title}" style="object-fit:cover;" class="blog-image-corner blog-standard-image-mobile hl-optimized mw-100" loading="lazy">
                </picture>
            </div>
        </div>
    </a>
    <div class="standard-blog-content">
        <h2 class="blog-title text-xl font-bold text-black font-sans">
            <a class="no-text-decoration" href="${post.url}">${post.title}</a>
        </h2>
        <div class="flex items-center">
            <div class="text-black text-xs" style="display:flex;">
                <span class="blog-author font-sans mr-2 flex items-center">
                    <span>${post.author || 'DynamicMike'}</span>
                </span>
            </div>
            <div class="text-black text-xs" style="display:flex;">
                <span class="blog-publish-date mr-2 font-sans"> Published on: ${post.date}</span>
            </div>
        </div>
        <p class="blog-description text-gray-700 mb-2 font-sans">${post.description}</p>
        <div class="flex flex-wrap">
            <span class="blog-tag bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs mr-2 mb-2 font-sans">${post.category}</span>
        </div>
        <div class="flex">
            <a href="${post.url}" class="blog-button text-light-blue focus:outline-none focus:underline active:text-light-blue font-sans readme-btn">
                Read more <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" fill="none" viewBox="0 0 15 24" stroke-width="2" stroke="#000" aria-hidden="true" class="w-5 h-5 readme-btn blog-button-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"></path></svg>
            </a>
        </div>
    </div>
</div>`).join('\n');
}

function generateIndexHtml(posts) {
    return posts.map(post => `
<div class="blog-item blog-column">
    <div class="blog-column-container">
        <div>
            <img src="${post.image}" alt="${post.title}" class="w-100 hl-optimized-fixed-size mw-100" loading="lazy" style="">
        </div>
        <div class="blog-item-box-2">
            <div class="blog-item-texts">
                <h2 class="blog-item-heading"><strong><a aria-label="${post.title}" href="${post.url}">${post.title}</a></strong></h2>
                <p class="blog-item-description">${post.description.substring(0, 150)}${post.description.length > 150 ? '...' : ''} <a aria-label="...more" class="compact-more-button" href="${post.url}">...more</a></p>
                <p class="blog-item-category"><span>${post.category} </span></p>
                <p class="blog-item-subtexts">
                    <span class="blog-item-date">${post.date}</span>
                    <span>•</span>
                    <span class="blog-item-read-time">3 min read</span>
                </p>
            </div>
        </div>
    </div>
</div>`).join('\n');
}

function updateFile(filePath, newContent) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const startIndex = content.indexOf(ANCHOR_START);
    const endIndex = content.indexOf(ANCHOR_END);

    if (startIndex !== -1 && endIndex !== -1) {
        const prefix = content.substring(0, startIndex + ANCHOR_START.length);
        const suffix = content.substring(endIndex);
        const updatedContent = prefix + "\n" + newContent + "\n" + suffix;
        fs.writeFileSync(filePath, updatedContent);
        console.log(`Updated ${path.basename(filePath)}`);
    } else {
        console.warn(`Anchors not found in ${path.basename(filePath)}`);
    }
}

function sync() {
    SITES.forEach(site => {
        console.log(`Processing site: ${site.name}`);
        if (!fs.existsSync(site.postsDir)) {
            console.warn(`Posts directory not found: ${site.postsDir}`);
            return;
        }

        const files = fs.readdirSync(site.postsDir).filter(f => f.endsWith('.html'));
        const posts = files.map(file => {
            const filePath = path.join(site.postsDir, file);
            const html = fs.readFileSync(filePath, 'utf8');
            return extractMetadata(html, filePath, site);
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update News Page
        const newsListingHtml = generateNewsHtml(posts);
        updateFile(site.newsFile, newsListingHtml);

        // Update Index Page
        const indexListingHtml = generateIndexHtml(posts);
        updateFile(site.indexFile, indexListingHtml);
    });
}

sync();
