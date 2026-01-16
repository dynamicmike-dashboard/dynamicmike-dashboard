export const dynamic = 'force-dynamic';
type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <h1 className="text-xl font-bold text-cyan-400">Admin Preview: {siteId}</h1>
        <a href="/" className="text-xs text-slate-500 hover:text-white">Exit</a>
      </div>
      
      {/* 'flex-1' tells the container to grow to fill all remaining space */}
      <div className="flex-1 bg-white">
        <iframe 
          src={iframeSrc} 
          className="w-full h-full border-none" 
          title="Admin Viewer"
        />
      </div>
    </div>
  );
}