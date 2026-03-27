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
       return NextResponse.json({ 
         files: [], 
         folders: [], 
         debug: { 
           dirPath, 
           exists: false,
           cwd: process.cwd()
         } 
       });
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const files = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
      .map(entry => entry.name)
      .sort((a, b) => b.localeCompare(a));
      
    const folders = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    return NextResponse.json({ files, folders, debug: { dirPath, exists: true, cwd: process.cwd() } });
  } catch (err: any) {
    return NextResponse.json({ 
      files: [], 
      folders: [], 
      error: err.message,
      debug: { dirPath, cwd: process.cwd() }
    });
  }
}