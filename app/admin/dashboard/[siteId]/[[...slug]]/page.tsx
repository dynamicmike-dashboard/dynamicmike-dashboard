export const dynamic = 'force-dynamic';
type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-cyan-400">Admin Preview: {siteId}</h1>
          <p className="text-[10px] text-slate-500 font-mono italic">Viewing: {fileName}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* CORRECTED LINK: Explicitly using ${siteId} */}
          <a 
            href={`/view/${siteId}`} 
            target="_blank" 
            className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-600/50 rounded-lg text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all"
          >
            View Live Public Site
          </a>
          <a href="/" className="text-xs text-slate-500 hover:text-white border border-slate-700 px-3 py-1 rounded">Exit</a>
        </div>
      </div>
      
      <div className="flex-1 bg-white">
        <iframe src={iframeSrc} className="w-full h-full border-none" title="Admin Viewer" />
      </div>
    </div>
  );
}