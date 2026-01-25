import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple mime type map to avoid dependency issues since 'mime' package is missing
// Update Timestamp: 2026-01-25 15:05
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  // Await params as per Next.js 15+ requirements
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  
  // Construct the relative path inside 'public/realai-elite'
  // If empty segments, it means request was /realai-elite or /realai-elite/
  let relativePath = pathSegments.join('/');
  
  // Default to index.html if empty
  if (!relativePath) {
    relativePath = 'index.html';
  }

  // Security: Prevent directory traversal
  if (relativePath.includes('..')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Determine filesystem path
  let filePath = '';
  
  // SPECIAL ROUTES: Map specific paths to the new "Maistermind" content files
  // NOTE: We moved files to 'public/realai-elite-assets' because Vercel was not seeing 'public/content'
  const assetsDir = path.join(process.cwd(), 'public', 'realai-elite-assets');
  
  if (pathSegments.length === 0) {
    // Landing Page
    filePath = path.join(assetsDir, 'realai-elite.html');
  } else if (pathSegments[0] === 'dashboard') {
    // New Agent OS Dashboard
    filePath = path.join(assetsDir, 'realai-elite-dashboard.html');
  } else if (pathSegments[0] === 'confirmation') {
    // Confirmation Page
    filePath = path.join(assetsDir, 'realai-elite-confirmation.html');
  } else {
     // Fallback / Asset delivery (e.g. images)
      filePath = path.join(assetsDir, relativePath);

      // Check legacy if not found in assets?
      if (!fs.existsSync(filePath)) {
          console.log(`[Manual Route] Asset not found in new dir, checking legacy: ${filePath}`);
           const legacyDir = path.join(process.cwd(), 'public', 'realai-elite-legacy', 'realai-app');
           filePath = path.join(legacyDir, relativePath);
           if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
           }
      }
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`[Manual Route] File not found: ${filePath}`);
    
    // DEBUGGING: List the directory contents to see where we are
    const cwd = process.cwd();
    let debugInfo = `Current Working Directory: ${cwd}\n`;
    debugInfo += `Attempted Path: ${filePath}\n`;
    
    try {
        const checkDir = path.dirname(filePath);
        if (fs.existsSync(checkDir)) {
             const files = fs.readdirSync(checkDir);
             debugInfo += `\nFiles in ${checkDir}:\n${files.join('\n')}`;
        } else {
             debugInfo += `\nDirectory does not exist: ${checkDir}`;
             const publicDir = path.join(cwd, 'public');
              if (fs.existsSync(publicDir)) {
                  debugInfo += `\nFiles in public:\n${fs.readdirSync(publicDir).join('\n')}`;
              }
        }
    } catch (e) {
        debugInfo += `Error listing files: ${e}`;
    }

    return new NextResponse(`File not found\n\nDEBUG INFO:\n${debugInfo}`, { status: 404 });
  }

  // Get content type
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // Cache control for performance (1 hour browser, 1 day CDN)
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error(`[Manual Route] Error reading file: ${filePath}`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
