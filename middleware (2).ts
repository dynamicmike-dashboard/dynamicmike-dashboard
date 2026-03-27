import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || "";

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