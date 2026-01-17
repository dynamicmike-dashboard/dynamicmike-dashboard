import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { siteId, fileName, code } = await request.json();

    // 1. Map to your local public/content folder
    const filePath = path.join(process.cwd(), 'public', 'content', siteId, fileName);

    // 2. Write the file to your F: drive
    fs.writeFileSync(filePath, code, 'utf8');

    return NextResponse.json({ success: true, message: "File saved successfully" });
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ success: false, error: "Failed to write file" }, { status: 500 });
  }
}