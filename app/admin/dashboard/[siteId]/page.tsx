export const dynamic = 'force-dynamic';

type Params = Promise<{ siteId: string }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId } = await props.params;

  // The URL will now point to the static file in the public folder
  const iframeSrc = `/content/${siteId}/index.html`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4 italic">
        Viewing Site: <span className="text-cyan-400">{siteId}</span>
      </h1>
      
      {/* This Iframe pulls the content instantly without server-side hanging */}
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