import { NextResponse } from 'next/server';
// Using eval to bypass Next.js static analysis and prevent tracing of the public/content folder
const fs = eval('require("fs")');
const path = eval('require("path")');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const folder = searchParams.get('folder') || 'img';

  if (!siteId) return NextResponse.json({ success: false, error: "Missing siteId" }, { status: 400 });

  const searchFolders = ['img', 'images'];
  let allImages: any[] = [];

  for (const folder of searchFolders) {
    const dirPath = path.join(process.cwd(), 'public', 'content', siteId, folder);
    if (fs.existsSync(dirPath)) {
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        const images = entries
          .filter((entry: any) => entry.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name))
          .map((entry: any) => ({
            name: entry.name,
            url: `/content/${siteId}/${folder}/${entry.name}`,
            folder
          }));
        allImages = [...allImages, ...images];
      } catch (err) {
        console.error(`Failed to list ${folder}:`, err);
      }
    }
  }

  // Sort all images alphabetically by name
  allImages.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ success: true, images: allImages });
}
