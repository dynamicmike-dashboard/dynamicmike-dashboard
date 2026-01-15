import { notFound } from 'next/navigation';
import { getSiteByDomain } from '@/lib/sites';
import fs from 'fs';
import path from 'path';

// This is the core 'Master Template' that handles all 12+ sites
export default async function SitePage({ params }: { params: { siteId: string } }) {
  const { siteId } = params;
  const site = getSiteByDomain(siteId);

  if (!site) return notFound();

  // 1. Fetch the 'Rescued HTML' from your local storage
  // We look in /content/[siteId]/index.html
  const filePath = path.join(process.cwd(), 'content', siteId, 'index.html');
  
  let htmlContent = "";
  try {
    htmlContent = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-cyan-400">
        <p className="animate-pulse">Waiting for content rescue...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      {/* 2. The 'Aura' Wrapper: Using Tailwind Typography for styling raw HTML */}
      <article className="prose prose-invert prose-cyan max-w-none px-6 py-12">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </main>
  );
}