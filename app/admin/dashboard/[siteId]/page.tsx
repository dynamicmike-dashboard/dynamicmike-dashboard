import { promises as fs } from 'fs';
import path from 'path';

type Params = Promise<{ siteId: string }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId } = await props.params;
  
  // 1. Locate the rescued index.html file
  const filePath = path.join(process.cwd(), 'content', siteId, 'index.html');
  
  let rescuedHtml = "";
  try {
    // 2. Read the file content from the disk
    rescuedHtml = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    rescuedHtml = `<div class="p-8 text-slate-400">No rescued content found for ${siteId}.</div>`;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Preview: <span className="text-cyan-400">{siteId}</span>
        </h2>
      </div>
      
      {/* 3. Inject the rescued HTML into the dashboard area */}
      <div className="rounded-xl border border-slate-800 bg-white text-black p-4 overflow-auto max-h-[70vh]">
        <div dangerouslySetInnerHTML={{ __html: rescuedHtml }} />
      </div>
    </div>
  );
}