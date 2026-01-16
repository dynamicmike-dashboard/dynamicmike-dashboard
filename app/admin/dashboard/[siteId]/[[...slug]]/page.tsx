export const dynamic = 'force-static';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;

  // Logic: No slug = index.html | slug ['about'] = about.html | slug ['news', 'post'] = news/post.html
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  
  // Point to the static file in the public folder
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-cyan-400 italic">Aura Rescue Dashboard</h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
            Site: {siteId} | File: {fileName}
          </p>
        </div>
        <div className="flex gap-3">
           <a href="/admin/dashboard/breath-of-life" className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs hover:bg-slate-800 transition-all">
            Home
          </a>
          <a href="/" className="px-3 py-1 bg-red-950/30 border border-red-900/50 rounded text-xs text-red-400 hover:bg-red-900/50">
            Exit
          </a>
        </div>
      </div>
      
      {/* The Rescue Viewer (Iframe) */}
      <div className="flex-1 border-4 border-slate-800 rounded-2xl overflow-hidden bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
        <iframe 
          src={iframeSrc} 
          className="w-full h-[82vh] border-none" 
          title="Rescued Content Viewer"
          loading="lazy"
        />
      </div>
    </div>
  );
}