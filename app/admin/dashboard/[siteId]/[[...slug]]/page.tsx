export const dynamic = 'force-dynamic'; // Use dynamic here to bypass the build-time spin

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-cyan-400">Admin: {siteId}</h1>
        <a href="/" className="text-xs opacity-50 hover:opacity-100">Exit</a>
      </div>
      <div className="flex-1 border-4 border-slate-800 rounded-xl overflow-hidden bg-white">
        <iframe src={iframeSrc} className="w-full h-[80vh] border-none" title="Preview" />
      </div>
    </div>
  );
}