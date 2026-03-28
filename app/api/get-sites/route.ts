import { NextResponse } from 'next/server';
// Using eval to bypass Next.js static analysis and prevent tracing of the public/content folder
const fs = eval('require("fs")');
const path = eval('require("path")');

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