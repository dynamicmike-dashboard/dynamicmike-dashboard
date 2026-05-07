import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * EMERGENCY KILL SWITCH
 * Set this to 'true' if the site is under attack or hitting Vercel limits too fast.
 * When enabled, all mapped sites will show a maintenance message instead of loading.
 */
const EMERGENCY_MAINTENANCE_MODE = false;

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || "";
  const path = url.pathname.toLowerCase();
  
  // 0. API Bypass
  if (path.startsWith('/api')) {
    return NextResponse.next();
  }

  // 1. Kill Switch Handling
  if (EMERGENCY_MAINTENANCE_MODE) {
    // Only apply to public domains, keep /admin accessible for fixes
    const isAdminPath = path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next');
    if (!isAdminPath) {
       return new NextResponse(
        `<html><body style="background:#020617;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:2rem;border:1px solid #1e293b;border-radius:1rem;background:#0f172a;">
            <h1 style="color:#22d3ee;margin-bottom:0.5rem;">System Optimization</h1>
            <p>This site is currently undergoing a planned maintenance update. Please check back shortly.</p>
          </div>
        </body></html>`,
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    }
  }

  // 2. Dashboard Entry Points (Vanity URLs)
  if (path === '/realai-dashboard' || path === '/realai-dashboard/') {
    return NextResponse.rewrite(new URL('/realai-elite/app.html', request.url));
  }

  if (path === '/realai-elite-dashboard' || path === '/realai-elite-dashboard/') {
    return NextResponse.rewrite(new URL('/realai-pages/realai-elite-dashboard.html', request.url));
  }

  // 3. Special Domain Routing (Split Worlds Strategy)
  if (hostname.includes('realiai.casa') || hostname.includes('realaicasa.com') || hostname.includes('realai.casa')) {
     if (path === '/' || path === '/index.html') {
         return NextResponse.rewrite(new URL('/realai-pages/realai-estateguard.html', request.url));
     }
  }

  if (hostname.includes('maistermind.com')) {
      if (path === '/realai-elite' || path === '/realai-elite/') {
           return NextResponse.rewrite(new URL('/realai-pages/realai-elite.html', request.url));
      }
      if (path === '/realai-elite/confirmation' || path === '/realai-elite/confirmation/') {
           return NextResponse.rewrite(new URL('/realai-pages/realai-elite-confirmation.html', request.url));
      }
  }

  // 4. Multi-Site Mapping logic
  const domainMap: Record<string, string> = {
    "breathoflifepdc.org": "breath-of-life",
    "celestialsigndesign.com": "celestial-sign-design",
    "chatall.day": "chatallday", 
    "chillmasterscotland.com": "chillmasterscotland",
    "consciousshifts.co.uk": "consciousshifts",
    "fifeart.com": "fifeart",
    "agenda.inspiringspeakerspdc.com": "inspiringspeakerspdc/agenda",
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

  const pureHost = hostname.split(':')[0].replace('www.', '').toLowerCase();
  const folderName = domainMap[pureHost];

  if (folderName) {
    // OPTIMIZATION: Bypass /view SSR page and rewrite directly to the static /content folder.
    // This stops usage of Serverless Function Invocations (Invocations limit).
    
    let targetPath = url.pathname;
    
    // Auto-append .html for clean URLs (like /news -> /news.html)
    // but ONLY if the path doesn't already have an extension.
    if (!targetPath.includes('.') && !targetPath.endsWith('/')) {
        targetPath += '.html';
    } else if (targetPath.endsWith('/')) {
        targetPath += 'index.html';
    }
    
    return NextResponse.rewrite(new URL(`/content/${folderName}${targetPath}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Broad exclusion for internal Next.js paths and the master content folder.
  // We MUST allow all other paths (including assets like .js, .png) so the domain mapping works.
  matcher: ['/((?!_next/static|_next/image|content|favicon\\.ico).*)'],
};
