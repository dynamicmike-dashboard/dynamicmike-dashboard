import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const { siteName } = await request.json();
    const folderName = siteName.toLowerCase().replace(/\s+/g, '-');
    const targetDir = path.join(process.cwd(), 'public', 'content', folderName);

    // 1. Create the folder on F: drive
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      
      // 2. Create a starter index.html
      const starterHTML = `<!DOCTYPE html>
<html>
<head><title>${siteName}</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h1>Welcome to ${siteName}</h1>
  <p>Rescued site folder created on F: drive.</p>
</body>
</html>`;
      
      fs.writeFileSync(path.join(targetDir, 'index.html'), starterHTML);

      // 3. Auto-Push to GitHub (only if local)
      if (process.env.NODE_ENV === 'development') {
        await execPromise('git add .');
        await execPromise(`git commit -m "New Rescue: Created ${folderName}"`);
        await execPromise('git push origin main');
      }

      return NextResponse.json({ success: true, folderName });
    } else {
      return NextResponse.json({ success: false, error: "Folder already exists" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}