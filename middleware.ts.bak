import { NextRequest, NextResponse } from 'next/server';
import { getSiteByDomain } from './lib/sites';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Identify if it's one of your 12 Client Sites from your Site Config
  const site = getSiteByDomain(hostname);

  if (site) {
    // Points the domain (e.g., breathoflifepdc.org) to your internal Master Template
    return NextResponse.rewrite(new URL(`/sites/${site.domain}${url.pathname}`, req.url));
  }

  // 2. Default behavior if no site matches
  return NextResponse.next();
}