import { notFound } from 'next/navigation';
import { getSiteByDomain } from '@/lib/sites';
import fs from 'fs';
import path from 'path';

export default async function SitePage({ params }: { params: { siteId: string, locale: string } }) {
  const { siteId, locale } = params;
  const site = getSiteByDomain(siteId);

  if (!site) return notFound();

  // 1. Logic: If locale is 'es', look for spanish.html, otherwise index.html
  const fileName = locale === 'es' ? 'spanish.html' : 'index.html';
  const filePath = path.join(process.cwd(), 'content', siteId, fileName);
  
  let htmlContent = "";
  try {
    htmlContent = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    // Fallback: If Spanish file doesn't exist, show English with a notice
    return (
      <div className="p-20 bg-slate-950 text-cyan-400">
        <h1 className="text-2xl mb-4">Content coming soon in Spanish...</h1>
        <p>Currently viewing the primary version.</p>
      </div>
    );
  }

  return (
    <article className="prose prose-invert prose-cyan max-w-none px-6 py-12">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </article>
  );
}