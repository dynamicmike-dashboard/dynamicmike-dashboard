import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Define your domain mappings here
  const domainData: Record<string, string> = {
    'charity-site.com': 'charity-site',
    'breath-of-life-rescue.org': 'breath-of-life',
  };

  const siteId = domainData[hostname || ''];

  if (siteId) {
    // Rewrite the internal path so the user sees the site, 
    // but the URL in their bar stays 'charity-site.com'
    return NextResponse.rewrite(new URL(`/view/${siteId}${url.pathname}`, request.url));
  }

  return NextResponse.next();
}