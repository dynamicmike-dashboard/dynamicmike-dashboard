import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteIdInput = searchParams.get('siteId');
  const folder = searchParams.get('folder') || '';

  if (!siteIdInput) return NextResponse.json({ files: [], folders: [] });

  const siteId = siteIdInput.toLowerCase();
  const baseContentDir = path.resolve(process.cwd(), 'public', 'content');
  const dirPath = path.join(baseContentDir, siteId, folder);
  
  console.log(`[API] Listing files in: ${dirPath}`);
  
  try {
    if (!fs.existsSync(dirPath)) {
       console.warn(`[API] Directory does not exist: ${dirPath}`);
       return NextResponse.json({ files: [], folders: [] });
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const files = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
      .map(entry => entry.name)
      .sort((a, b) => b.localeCompare(a)); // Sort descending to put newest posts at top
      
    const folders = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    return NextResponse.json({ files, folders });
  } catch (err) {
    console.error(`[API] Error reading ${dirPath}:`, err);
    return NextResponse.json({ files: [], folders: [] });
  }
}