export default function EmergencyPage() {
  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Aura Dashboard</h1>
        <p className="text-slate-400 font-mono">Status: Engine Online - Checking Routes...</p>
        <div className="mt-4 p-2 bg-slate-900 border border-slate-800 rounded">
           <a href="/admin/dashboard/breath-of-life" className="text-cyan-400 hover:underline">
             Try Dashboard Link Directly →
           </a>
        </div>
      </div>
    </div>
  );
}