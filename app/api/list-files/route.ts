import { NextResponse } from 'next/server';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteIdInput = searchParams.get('siteId');
  const folder = searchParams.get('folder') || '';

  if (!siteIdInput) return NextResponse.json({ files: [], folders: [] });

  const siteId = siteIdInput.toLowerCase();
  
  // Try multiple base directory resolutions for different environments (local vs Vercel)
  const possibleBases = [
    path.resolve(process.cwd(), 'public', 'content'),
    path.resolve(process.cwd(), '.next', 'server', 'public', 'content'),
    path.resolve(process.cwd(), '..', 'public', 'content'),
  ];
  
  let dirPath = "";
  let exists = false;
  
  for (const base of possibleBases) {
    const candidate = path.join(base, siteId, folder);
    if (fs.existsSync(candidate)) {
      dirPath = candidate;
      exists = true;
      break;
    }
  }

  // Final fallback (local dev)
  if (!exists) {
    dirPath = path.join(process.cwd(), 'public', 'content', siteId, folder);
  }

  try {
    if (!fs.existsSync(dirPath)) {
       return NextResponse.json({ 
         files: [], 
         folders: [], 
         debug: { 
           dirPath, 
           exists: false,
           cwd: process.cwd(),
           basesTested: possibleBases,
           cwdListing: fs.readdirSync(process.cwd())
         } 
       });
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const files = entries
      .filter((entry: any) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry: any) => entry.name)
      .sort((a: any, b: any) => b.localeCompare(a));
      
    const folders = entries
      .filter((entry: any) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry: any) => entry.name);

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