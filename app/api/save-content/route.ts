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

    // 🕒 INDEX SYNC: Auto-update the Home Page (index.html) entry for this post
    if (fileName.startsWith('post/')) {
        try {
            const indexPath = path.join(process.cwd(), 'public', 'content', siteId, 'index.html');
            if (fs.existsSync(indexPath)) {
                const urlSlug = fileName.replace('post/', '').replace('.html', '');
                let indexContent = fs.readFileSync(indexPath, 'utf8');

                // Extract metadata from the new code
                const titleMatch = code.match(/<title>(.*?)<\/title>/);
                const descMatch = code.match(/<meta name="description" content="(.*?)"/);
                const imageMatch = code.match(/<meta property="og:image" content="(.*?)"/);

                const title = titleMatch ? titleMatch[1] : "";
                const desc = descMatch ? descMatch[1] : "";
                const image = imageMatch ? imageMatch[1] : "";

                // 1. Update the JSON Interceptor (extraPosts)
                const postRegex = new RegExp(`(\\{[^}]*"urlSlug":"${urlSlug}"[^}]*\\})`, 'g');
                indexContent = indexContent.replace(postRegex, (match) => {
                    let updated = match;
                    if (title) updated = updated.replace(/"title":".*?"/, `"title":"${JSON.stringify(title).slice(1,-1)}"`);
                    if (desc) updated = updated.replace(/"description":".*?"/, `"description":"${JSON.stringify(desc).slice(1,-1)}"`);
                    if (image) updated = updated.replace(/"imageUrl":".*?"/, `"imageUrl":"${image}"`);
                    return updated;
                });

                // 2. Update Hardcoded Body Images (by alt text or link)
                const imgTagRegex = new RegExp(`(<img[^>]*alt="[^"]*${urlSlug.replace(/-/g, ' ')}[^"]*"[^>]*src=")([^"]*)("[^>]*>)`, 'gi');
                indexContent = indexContent.replace(imgTagRegex, `$1${image}$3`);

                fs.writeFileSync(indexPath, indexContent);
                // Note: gitLog is defined below, so we will handle the concatenation there
            }
        } catch (syncErr) {
            console.error("Index Sync failed:", syncErr);
        }
    }

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