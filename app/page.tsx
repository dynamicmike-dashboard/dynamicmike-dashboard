export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-5xl font-black text-cyan-400 mb-8">AURA DYNAMIC</h1>
      <div className="grid gap-4">
        <a href="/breath-of-life" className="bg-cyan-600 px-6 py-3 rounded-xl font-bold text-center">
          Visit Public Site
        </a>
        <a href="/admin/dashboard/breath-of-life" className="border border-slate-700 px-6 py-3 rounded-xl text-slate-400 text-center">
          Open Admin Dashboard
        </a>
      </div>
    </div>
  );
}