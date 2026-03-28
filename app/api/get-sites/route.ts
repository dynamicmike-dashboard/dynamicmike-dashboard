import { NextResponse } from 'next/server';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

export async function GET() {
  const contentDir = path.join(process.cwd(), 'public', 'content');
  try {
    const folders = fs.readdirSync(contentDir).filter((file: string) => {
      return fs.statSync(path.join(contentDir, file)).isDirectory();
    });
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json([]);
  }
}