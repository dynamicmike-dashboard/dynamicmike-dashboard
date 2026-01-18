import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { siteId, htmlContent } = await request.json();
    
    // Path to your F: drive content folder
    const imagesDir = path.join(process.cwd(), 'public', 'content', siteId, 'images');

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    let updatedHtml = htmlContent;
    let count = 0;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const externalUrl = match[1];

      // Only rescue external links (GHL or Google)
      if (externalUrl.includes('http')) {
        try {
          const urlObj = new URL(externalUrl);
          // NEW FILENAME LOGIC: Truncate long AI prompt filenames
          let fileName = path.basename(urlObj.pathname).split('?')[0];
          
          if (!fileName || fileName.length > 50 || fileName.length < 3) {
            // Generates a short, unique name like img-1737241800-452.png
            fileName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
          }
          
          const localPath = path.join(imagesDir, fileName);

          // Fetch from Google/GHL and save to F: drive
          const response = await axios.get(externalUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(localPath, Buffer.from(response.data));

          // Update the HTML reference
          updatedHtml = updatedHtml.replace(externalUrl, `images/${fileName}`);
          count++;
        } catch (err) {
          console.error(`Skipped: ${externalUrl}`);
        }
      }
    }

    return NextResponse.json({ success: true, updatedHtml, count });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}