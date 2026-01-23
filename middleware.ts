import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || "";

  // ---------------------------------------------------------
  // FIX: Force RealAi-Elite to serve from static folder (realai-app)
  // This bypasses Next.js dynamic routing and case-sensitivity issues
  // ---------------------------------------------------------
  const path = url.pathname.toLowerCase();
  
  // 1. Main Entry Point (and legacy .html access)
  if (
    path === '/realai-elite' || 
    path === '/realai-elite/' || 
    url.pathname.endsWith('realai-elite.html') // Check original casing for file
  ) {
    return NextResponse.rewrite(new URL('/realai-app/index.html', request.url));
  }

  // 2. Dashboard Entry Point
  if (path === '/realai-dashboard' || path === '/realai-dashboard/') {
    return NextResponse.rewrite(new URL('/realai-app/app.html', request.url));
  }

  // 3. Asset/Subpath handling (CSS, JS, Images)
  // Check for both cases to be safe, though we lowercased 'path' variable for checking
  if (path.startsWith('/realai-elite/') || path.startsWith('/realai-app/')) {
    // Replace the start of the path with the correct static folder location
    // We use original url.pathname to preserve casing of filenames if they matter (though usually static assets are lowercase now)
    // But since we renamed folder to 'realai-app', we just want to map /realai-elite/XYZ -> /realai-app/XYZ
    
    // logic: if user asks for /realai-elite/style.css -> /realai-app/style.css
    const newPath = url.pathname.replace(/^\/realai-elite/i, '/realai-app');
    return NextResponse.rewrite(new URL(newPath, request.url));
  }
  // ---------------------------------------------------------

  // Your verified domain mapping
  const domainMap: Record<string, string> = {
    "breathoflifepdc.org": "breath-of-life",
    "celestialsigndesign.com": "celestial-sign-design",
    "chatall.day": "chatallday", 
    "chillmasterscotland.com": "chillmasterscotland",
    "consciousshifts.co.uk": "consciousshifts",
    "fifeart.com": "fifeart",
    "inspiringspeakerspdc.com": "inspiringspeakerspdc",
    "louisevandervelde.com": "louisevandervelde",
    "maistermind.com": "maistermind",
    "nahuala.bio": "nahuala",
    "pdcyes.com": "pdcyes",
    "playa.photos": "playaphotos",
    "playavida.org": "playavida",
    "pranatowers.com": "pranatowers",
    "realaicasa.com": "realaicasas",
    "reallifeavengers.com": "reallifeavengers",
    "social-media-management-services.com": "smms",
  };

 

  // Handle both 'domain.com' and 'www.domain.com'
  const pureHost = hostname.replace('www.', '');
  const folderName = domainMap[pureHost];

  if (folderName) {
    // Rewrite internal path to /view/[folderName]
    // The user stays on their custom domain in the browser bar
    return NextResponse.rewrite(new URL(`/view/${folderName}${url.pathname}`, request.url));
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on page requests, not images/assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|content|favicon.ico).*)'],
};