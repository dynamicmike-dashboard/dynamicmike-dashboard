import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function DynamicRescuedPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;

  // 1. Determine the filename (index.html if root)
  const fileName = slug ? `${slug.join('/')}.html` : 'index.html';
  
  // 2. Use a more reliable path joining for Vercel
  // This looks specifically for the content folder relative to the project root
  const contentDirectory = path.join(process.cwd(), 'content');
  const filePath = path.join(contentDirectory, siteId, fileName);

  try {
    // 3. Check if file exists before reading
    const htmlContent = await fs.readFile(filePath, 'utf8');

    return (
      <div className="flex-1 p-8 pt-6 space-y-4">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              Live Preview: <span className="text-cyan-400">{siteId}</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">File: {fileName}</span>
         </div>
        
        {/* The White "Rescue" Container */}
        <div className="bg-white rounded-lg shadow-2xl p-6 text-black min-h-[80vh] overflow-auto border-4 border-slate-800">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Path Error:", filePath); // This will show in Vercel Logs
    return (
      <div className="p-20 text-center">
        <h1 className="text-white text-xl">Content Not Found</h1>
        <p className="text-slate-500">Looked for: content/{siteId}/{fileName}</p>
      </div>
    );
  }
}