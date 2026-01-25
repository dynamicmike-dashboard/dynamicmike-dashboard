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
  
  // SPECIAL ROUTES: Map specific paths to the new lightweight HTML folder
  // HTML files are in 'public/realai-pages' (bundled with Lambda)
  // Images are in 'public/realai-elite-assets' (served statically, referenced by absolute URL in HTML)
  const pagesDir = path.join(process.cwd(), 'public', 'realai-pages');
  
  if (pathSegments.length === 0) {
    // Landing Page
    filePath = path.join(pagesDir, 'realai-elite.html');
  } else if (pathSegments[0] === 'dashboard') {
    // New Agent OS Dashboard
    filePath = path.join(pagesDir, 'realai-elite-dashboard.html');
  } else if (pathSegments[0] === 'confirmation') {
    // Confirmation Page
    filePath = path.join(pagesDir, 'realai-elite-confirmation.html');
  } else {
     // Fallback: This route handler should NO LONGER serve assets.
     // Assets are served statically from /realai-elite-assets/...
     // Use debug logic or returns 404.
    return new NextResponse('Resource not found. If looking for assets, ensure URL is /realai-elite-assets/...', { status: 404 });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`[Manual Route] File not found: ${filePath}`);
    return new NextResponse('File not found', { status: 404 });
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
