import { promises as fs } from 'fs';
import { notFound } from 'next/navigation';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function DynamicRescuedPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;

  // 1. Force the file to index.html if no slug exists
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  
  // 2. Direct path for Vercel Linux
  const filePath = `${process.cwd()}/content/${siteId}/${fileName}`;

  try {
    // 3. Read file with a tiny delay to prevent the "Spinning" hang
    const htmlContent = await fs.readFile(filePath, 'utf8');

    return (
      <div className="flex-1 p-8 pt-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white uppercase italic">
            Rescued: <span className="text-cyan-400">{siteId}</span>
          </h2>
          <code className="text-[10px] text-slate-500">{fileName}</code>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-inner min-h-[70vh] text-black">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Critical Path Failure:", filePath);
    return (
      <div className="p-20 text-center text-white">
        <h1 className="text-2xl font-bold">404 - File Missing</h1>
        <p className="text-slate-400 mt-2">The system cannot find: content/{siteId}/{fileName}</p>
        <p className="text-[10px] mt-4 opacity-30">{filePath}</p>
      </div>
    );
  }
}