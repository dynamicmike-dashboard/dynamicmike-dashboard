import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const { siteId, fileName, templatePath } = await request.json();

    if (!siteId || !fileName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const targetPath = path.join(process.cwd(), 'public', 'content', siteId, fileName.endsWith('.html') ? fileName : `${fileName}.html`);
    const targetDir = path.dirname(targetPath);

    // 1. Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 2. Error if file already exists
    if (fs.existsSync(targetPath)) {
      return NextResponse.json({ success: false, error: "File already exists" }, { status: 400 });
    }

    // 3. Copy from template or create empty
    if (templatePath) {
      const sourcePath = path.join(process.cwd(), 'public', 'content', templatePath);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      } else {
        fs.writeFileSync(targetPath, '<!DOCTYPE html><html><body><h1>New Post</h1></body></html>', 'utf8');
      }
    } else {
      fs.writeFileSync(targetPath, '<!DOCTYPE html><html><body><h1>New Post</h1></body></html>', 'utf8');
    }

    // 4. Git Auto-Push (Development only)
    if (process.env.NODE_ENV === 'development') {
      try {
        await execPromise('git add .');
        await execPromise(`git commit -m "Admin Create: ${siteId} - ${fileName}"`);
        await execPromise('git push origin main');
      } catch (gitError) {
        console.error("Git Auto-Push failed:", gitError);
      }
    }

    return NextResponse.json({ success: true, message: "File created successfully" });
  } catch (error) {
    console.error("Critical Create Failure:", error);
    return NextResponse.json({ success: false, error: "Critical Create Failure" }, { status: 500 });
  }
}
