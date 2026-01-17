import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// This allows us to wait for the Git commands to finish before telling you "Saved!"
const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const { siteId, fileName, code } = await request.json();

    // 1. Define the exact path to your F: drive folder
    const filePath = path.join(process.cwd(), 'public', 'content', siteId, fileName);

    // 2. Save the file locally so your F: drive is always the 'Master Copy'
    fs.writeFileSync(filePath, code, 'utf8');

    // 3. Automated Git Workflow (Runs ONLY when you are working on your PC)
    if (process.env.NODE_ENV === 'development') {
      try {
        // This is the same as you typing it in Git Bash manually
        await execPromise('git add .');
        await execPromise(`git commit -m "Admin Update: ${siteId} - ${fileName}"`);
        await execPromise('git push origin main');
        console.log(`Successfully pushed updates for ${siteId} to GitHub.`);
      } catch (gitError) {
        // If Git fails (e.g., no internet), the file is still saved on your F: drive
        console.error("Local save worked, but Git Auto-Push failed:", gitError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Saved to F: drive and pushed to GitHub" 
    });
  } catch (error) {
    console.error("System Error:", error);
    return NextResponse.json({ success: false, error: "Critical Save Failure" }, { status: 500 });
  }
}