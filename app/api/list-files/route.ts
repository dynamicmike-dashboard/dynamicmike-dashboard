import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) return NextResponse.json({ files: [] });

  const dirPath = path.join(process.cwd(), 'public', 'content', siteId);
  
  try {
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.html')); // Only look for HTML pages
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ files: [] });
  }
}