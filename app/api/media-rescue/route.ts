import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { siteId, htmlContent } = await request.json();
    const imagesDir = path.join(process.cwd(), 'public', 'content', siteId, 'images');

    // Create images folder if it doesn't exist
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    // Find all image URLs (src="...")
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    let updatedHtml = htmlContent;
    const downloadedFiles = [];

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const externalUrl = match[1];
      
      // Skip if already local or a data URI
      if (externalUrl.startsWith('images/') || externalUrl.startsWith('data:')) continue;

      try {
        const fileName = path.basename(new URL(externalUrl).pathname) || `img-${Date.now()}.png`;
        const localPath = path.join(imagesDir, fileName);

        // Download the image
        const response = await axios.get(externalUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(localPath, Buffer.from(response.data));

        // Update the HTML string to use local path
        updatedHtml = updatedHtml.replace(externalUrl, `images/${fileName}`);
        downloadedFiles.push(fileName);
      } catch (e) {
        console.error(`Failed to download: ${externalUrl}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      updatedHtml, 
      count: downloadedFiles.length 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Media rescue failed" }, { status: 500 });
  }
}