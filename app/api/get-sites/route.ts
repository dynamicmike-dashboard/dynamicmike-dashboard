import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const contentDir = path.join(process.cwd(), 'public', 'content');
  try {
    const folders = fs.readdirSync(contentDir).filter((file) => {
      return fs.statSync(path.join(contentDir, file)).isDirectory();
    });
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json([]);
  }
}