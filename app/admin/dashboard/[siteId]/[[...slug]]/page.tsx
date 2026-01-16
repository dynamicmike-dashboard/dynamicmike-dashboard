export const dynamic = 'force-dynamic';

type Params = Promise<{ siteId: string }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  const { siteId } = await props.params;

  return (
    <div className="p-20 text-white bg-slate-950 min-h-screen">
      <div className="max-w-2xl mx-auto border-2 border-cyan-500 p-10 rounded-2xl bg-slate-900 shadow-2xl">
        <h1 className="text-4xl font-black italic mb-4">
          PHASE 1 COMPLETE
        </h1>
        <p className="text-xl text-slate-300">
          Route <span className="text-cyan-400 font-mono">[{siteId}]</span> is now responding.
        </p>
        <div className="mt-8 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            If you see this, the spinning has stopped. 
            We can now safely re-attach the file system.
          </p>
        </div>
      </div>
    </div>
  );
}