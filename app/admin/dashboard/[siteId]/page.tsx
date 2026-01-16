export const dynamic = 'force-static'; // Force this to be a simple static shell

export default function AdminDashboardPage({ params }: { params: { siteId: string } }) {
  const siteId = params.siteId;
  const iframeSrc = `/content/${siteId}/index.html`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold italic text-cyan-400">
          Aura Preview: {siteId}
        </h1>
        <a href="/" className="text-xs text-slate-500 hover:text-white underline">
          Close Preview
        </a>
      </div>
      
      <div className="flex-1 border-4 border-slate-800 rounded-xl overflow-hidden bg-white shadow-2xl">
        <iframe 
          src={iframeSrc} 
          className="w-full h-[80vh] border-none" 
          title="Rescued Content"
          loading="lazy"
        />
      </div>
    </div>
  );
}