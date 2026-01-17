import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const contentDir = path.join(process.cwd(), 'public', 'content');
  const ghlPattern = /https:\/\/cdn\.msgsndr\.com\/[^\s"']+/g;
  let report: any[] = [];

  try {
    const sites = fs.readdirSync(contentDir).filter(f => fs.statSync(path.join(contentDir, f)).isDirectory());

    sites.forEach(site => {
      const sitePath = path.join(contentDir, site);
      const files = fs.readdirSync(sitePath).filter(f => f.endsWith('.html'));
      
      files.forEach(file => {
        const content = fs.readFileSync(path.join(sitePath, file), 'utf8');
        const matches = content.match(ghlPattern);
        
        if (matches) {
          report.push({
            site,
            file,
            count: matches.length,
            links: Array.from(new Set(matches)) // Unique links only
          });
        }
      });
    });

    return NextResponse.json({ 
      totalSitesChecked: sites.length,
      sitesWithGHLImages: report.length,
      details: report 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to scan files" }, { status: 500 });
  }
}