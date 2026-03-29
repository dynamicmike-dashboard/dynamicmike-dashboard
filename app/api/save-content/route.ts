import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// This allows us to wait for the Git commands to finish before telling you "Saved!"
const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const { siteId: siteIdRaw, fileName, code, syncEnabled } = await request.json();
    const siteId = siteIdRaw?.toLowerCase();

    // 1. Define the exact path to your F: drive folder
    const filePath = path.join(process.cwd(), 'public', 'content', siteId, fileName);
    
    // Ensure the directory exists before writing (Fixes "No such file or directory" errors)
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 2. Save the file locally so your F: drive is always the 'Master Copy'
    fs.writeFileSync(filePath, code, 'utf8');

    // 3. Automated Git Workflow (Runs ONLY when you are working on your PC and sync is on)
    let gitLog = "Git sync disabled via 'Local Only' toggle";
    let gitSuccess = true;

    if (process.env.NODE_ENV === 'development' && syncEnabled !== false) {
      try {
        await execPromise('git add .');
        try {
          await execPromise(`git commit -m "Admin Update: ${siteId} - ${fileName}"`);
        } catch (commitErr) {
          // If there are no changes, commit might fail. We still try to push.
          console.log("No changes to commit or commit failed.");
        }
        await execPromise('git push origin main');
        gitLog = "Pushed to GitHub successfully.";
      } catch (gitError: any) {
        gitSuccess = false;
        gitLog = gitError.message || "Git Push failed";
        console.error("Git Auto-Push failed:", gitLog);
      }
    }

    return NextResponse.json({ 
      success: true, 
      gitSuccess,
      gitLog,
      message: gitSuccess ? "Saved and Pushed!" : "Saved locally, but Git Push failed.",
      debug: { filePath, cwd: process.cwd(), dirExists: fs.existsSync(dirPath) }
    });
  } catch (error: any) {
    console.error("System Error during save:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Critical Save Failure",
      details: error.stack
    }, { status: 500 });
  }
}