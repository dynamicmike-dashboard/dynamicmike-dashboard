export const dynamic = 'force-dynamic';

export default function TestSitePage() {
  return (
    <div className="p-20 text-white bg-slate-950 min-h-screen">
      <div className="border-4 border-yellow-500 p-10 bg-slate-900">
        <h1 className="text-3xl font-bold">HARDCODED ROUTE TEST</h1>
        <p className="mt-4">If this loads, the dynamic [siteId] folder is the problem.</p>
      </div>
    </div>
  );
}