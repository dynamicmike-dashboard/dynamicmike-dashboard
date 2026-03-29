import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const GITHUB_API_URL = 'https://api.github.com/repos';

// Helper: Sync Metadata to Home Page (index.html)
async function syncHomePageIndex(siteId: string, fileName: string, code: string) {
    try {
        if (!fileName.startsWith('post/')) return "";
        
        const indexPath = path.join(process.cwd(), 'public', 'content', siteId, 'index.html');
        if (!fs.existsSync(indexPath)) return "";

        const urlSlug = fileName.replace('post/', '').replace('.html', '');
        let indexContent = fs.readFileSync(indexPath, 'utf8');

        // Extract metadata from the new code
        const titleMatch = code.match(/<title>(.*?)<\/title>/);
        const descMatch = code.match(/<meta name="description" content="(.*?)"/);
        const imageMatch = code.match(/<meta property="og:image" content="(.*?)"/);

        const title = titleMatch ? titleMatch[1] : "";
        const desc = descMatch ? descMatch[1] : "";
        const image = imageMatch ? imageMatch[1] : "";

        // 1. Update the JSON interceptor
        const postRegex = new RegExp(`(\\{[^}]*"urlSlug":"${urlSlug}"[^}]*\\})`, 'g');
        indexContent = indexContent.replace(postRegex, (match) => {
            let updated = match;
            if (title) updated = updated.replace(/"title":".*?"/, `"title":"${JSON.stringify(title).slice(1,-1)}"`);
            if (desc) updated = updated.replace(/"description":".*?"/, `"description":"${JSON.stringify(desc).slice(1,-1)}"`);
            if (image) updated = updated.replace(/"imageUrl":".*?"/, `"imageUrl":"${image}"`);
            return updated;
        });

        // 2. Update hardcoded HTML image tags (using slug as alt anchor)
        const displaySlug = urlSlug.replace(/-/g, ' ');
        const imgTagRegex = new RegExp(`(<img[^>]*alt="[^"]*${displaySlug}[^"]*"[^>]*src=")([^"]*)("[^>]*>)`, 'gi');
        indexContent = indexContent.replace(imgTagRegex, `$1${image}$3`);

        fs.writeFileSync(indexPath, indexContent);
        return " + Home Page Synced!";
    } catch (err) {
        console.error("Index Sync Error:", err);
        return " ! Index Sync Failed";
    }
}

// Helper: Push directly to GitHub via API (Option A)
async function saveToGitHub(siteId: string, fileName: string, code: string, message: string) {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.REPO_OWNER || 'dynamicmike-dashboard';
    const repo = process.env.REPO_NAME || 'dynamicmike-dashboard';
    
    if (!token) return { success: false, log: "GitHub token not configured" };

    try {
        const filePath = `public/content/${siteId}/${fileName}`;
        const url = `${GITHUB_API_URL}/${owner}/${repo}/contents/${filePath}`;

        // Get current SHA
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        let sha = "";
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        }

        // Commit via API
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                content: Buffer.from(code).toString('base64'),
                sha: sha
            })
        });

        return { success: putRes.ok, log: putRes.ok ? "✓ Cloud Sync OK" : "Cloud Sync Failed" };
    } catch (e: any) {
        return { success: false, log: `Cloud Error: ${e.message}` };
    }
}

export async function POST(request: Request) {
  try {
    const { siteId, fileName, code, syncEnabled } = await request.json();
    const normalizedSiteId = siteId?.toLowerCase();

    // 1. Local Path Resolution
    const filePath = path.join(process.cwd(), 'public', 'content', normalizedSiteId, fileName);
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    // 2. Local Save
    let localSuccess = true;
    try { fs.writeFileSync(filePath, code, 'utf8'); } catch (e) { localSuccess = false; }

    // 3. Home Page Sync
    const indexLog = await syncHomePageIndex(normalizedSiteId, fileName, code);

    // 4. Cloud / Git Sync
    let gitLog = "Sync Off";
    let gitSuccess = true;

    if (syncEnabled) {
        // Option A: Direct API Push
        const cloudResult = await saveToGitHub(normalizedSiteId, fileName, code, `Update ${normalizedSiteId}/${fileName}`);
        gitLog = cloudResult.log + indexLog;
        gitSuccess = cloudResult.success;

        // Option B: Local Git CLI (Backup)
        if (process.env.NODE_ENV === 'development') {
            try {
                await execPromise('git add .');
                await execPromise(`git commit -m "Dashboard Save: ${normalizedSiteId}/${fileName}"`).catch(() => {});
                await execPromise('git push origin main').catch(() => {});
                gitLog += " (Git pushed)";
            } catch (p) {}
        }
    }

    return NextResponse.json({ 
      success: localSuccess || gitSuccess, 
      gitSuccess,
      gitLog,
      message: localSuccess ? "Saved successfully!" : "Saved to Cloud only",
      debug: { filePath }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}