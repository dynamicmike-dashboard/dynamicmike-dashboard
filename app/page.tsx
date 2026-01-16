export default function EmergencyPage() {
  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center text-white p-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Aura Dashboard Status: Reset</h1>
        <p className="text-slate-400">If you see this, the redirect loop is broken.</p>
        <div className="mt-6">
          <a href="/admin/dashboard/breath-of-life" className="text-cyan-500 underline">Try Dashboard Link</a>
        </div>
      </div>
    </div>
  );
}