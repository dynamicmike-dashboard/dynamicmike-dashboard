import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const { siteId, fileName, templatePath } = await request.json();

    if (!siteId || !fileName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const targetPath = path.join(process.cwd(), 'public', 'content', siteId, fileName.endsWith('.html') ? fileName : `${fileName}.html`);
    const targetDir = path.dirname(targetPath);

    // 1. Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 2. Error if file already exists
    if (fs.existsSync(targetPath)) {
      return NextResponse.json({ success: false, error: "File already exists" }, { status: 400 });
    }

    // 3. Copy from template or create empty
    let content = '<!DOCTYPE html><html><head><title>New Page</title></head><body><h1>New Page</h1></body></html>';
    
    if (templatePath) {
      const sourcePath = path.join(process.cwd(), 'public', 'content', templatePath);
      if (fs.existsSync(sourcePath)) {
        content = fs.readFileSync(sourcePath, 'utf8');
      }
    }

    // 4. Inject Baseline SEO if it's a new or templated file
    const siteName = siteId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const pageTitle = fileName.replace('.html', '').split('/').pop()?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "New Page";
    
    const baselineSEO = {
      title: `${pageTitle} | ${siteName}`,
      description: `Learn more about ${pageTitle} at ${siteName}. Dedicated to providing the best information and services.`,
      keywords: `${siteId.replace(/-/g, ', ')}, ${pageTitle.toLowerCase()}, blog, resources`
    };

    // Replace or inject <title>
    if (content.includes('<title>')) {
      content = content.replace(/<title>.*?<\/title>/, `<title>${baselineSEO.title}</title>`);
    } else {
      content = content.replace('</head>', `<title>${baselineSEO.title}</title></head>`);
    }

    // Replace or inject Meta Tags
    const metaTags = `
    <meta name="description" content="${baselineSEO.description}">
    <meta name="keywords" content="${baselineSEO.keywords}">
    <meta property="og:title" content="${baselineSEO.title}">
    <meta property="og:description" content="${baselineSEO.description}">
    `;

    if (content.includes('</head>')) {
      content = content.replace('</head>', `${metaTags}\n</head>`);
    }

    fs.writeFileSync(targetPath, content, 'utf8');

    // 4. Git Auto-Push (Development only)
    if (process.env.NODE_ENV === 'development') {
      try {
        await execPromise('git add .');
        await execPromise(`git commit -m "Admin Create: ${siteId} - ${fileName}"`);
        await execPromise('git push origin main');
      } catch (gitError) {
        console.error("Git Auto-Push failed:", gitError);
      }
    }

    return NextResponse.json({ success: true, message: "File created successfully" });
  } catch (error) {
    console.error("Critical Create Failure:", error);
    return NextResponse.json({ success: false, error: "Critical Create Failure" }, { status: 500 });
  }
}
