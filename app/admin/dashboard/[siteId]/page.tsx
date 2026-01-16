export const dynamic = 'force-dynamic';

type Params = Promise<{ siteId: string }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId } = await props.params;

  // This points to the static file now sitting in /public
  const iframeSrc = `/content/${siteId}/index.html`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold italic">
          Viewing Site: <span className="text-cyan-400">{siteId}</span>
        </h1>
        <a href="/" className="text-xs text-slate-500 hover:text-white underline">Back to Home</a>
      </div>
      
      {/* The iframe loads the static HTML instantly without server-side lag */}
      <div className="flex-1 border-4 border-slate-800 rounded-xl overflow-hidden bg-white">
        <iframe 
          src={iframeSrc} 
          className="w-full h-[80vh]" 
          title="Rescued Content"
        />
      </div>
    </div>
  );
}