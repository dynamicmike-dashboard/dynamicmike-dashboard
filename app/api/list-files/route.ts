import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const folder = searchParams.get('folder') || '';

  if (!siteId) return NextResponse.json({ files: [], folders: [] });

  const dirPath = path.join(process.cwd(), 'public', 'content', siteId, folder);
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const files = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
      .map(entry => entry.name);
      
    const folders = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    return NextResponse.json({ files, folders });
  } catch (err) {
    return NextResponse.json({ files: [], folders: [] });
  }
}