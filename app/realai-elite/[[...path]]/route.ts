import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple mime type map to avoid dependency issues since 'mime' package is missing
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
  // Note: Vercel 'standalone' output copies public folder, but even if not, 
  // typical deployments have public at root.
  const publicDir = path.join(process.cwd(), 'public', 'realai-elite');
  let filePath = path.join(publicDir, relativePath);

  // If path is a directory, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
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
