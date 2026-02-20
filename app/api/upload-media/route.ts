import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const siteId = formData.get('siteId') as string;
    const customName = formData.get('customName') as string;
    const folder = formData.get('folder') as string || 'img';

    if (!file || !siteId) {
      return NextResponse.json({ success: false, error: "Missing file or siteId" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name);
    const fileName = customName ? `${customName}${extension}` : file.name;
    
    const targetDir = path.join(process.cwd(), 'public', 'content', siteId, folder);
    const targetPath = path.join(targetDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, buffer);

    // Git Auto-Push (Development only)
    if (process.env.NODE_ENV === 'development') {
      try {
        await execPromise('git add .');
        await execPromise(`git commit -m "Admin Upload: ${siteId}/${folder}/${fileName}"`);
        await execPromise('git push origin main');
      } catch (gitError) {
        console.error("Git Auto-Push failed:", gitError);
      }
    }

    const publicUrl = `/${folder}/${fileName}`; // Middleware handles siteId prefixing usually, or use absolute
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName,
      path: targetPath
    });
  } catch (error) {
    console.error("Upload Failure:", error);
    return NextResponse.json({ success: false, error: "Upload Failure" }, { status: 500 });
  }
}
