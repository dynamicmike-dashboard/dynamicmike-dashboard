export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col items-center justify-center p-10 font-sans">
      <h1 className="text-5xl font-black text-cyan-400 mb-8 italic tracking-tighter">AURA DYNAMIC</h1>
      
      <div className="grid gap-4 w-full max-w-xs">
        {/* CHANGED THIS LINK TO /view/ */}
        <a href="/view/breath-of-life" className="bg-cyan-600 px-6 py-4 rounded-xl font-bold text-center hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20">
          Visit Public Site
        </a>
        
        <a href="/admin/dashboard/breath-of-life" className="border border-slate-700 px-6 py-4 rounded-xl text-slate-400 text-center hover:bg-slate-900 transition-colors">
          Open Admin Dashboard
        </a>
      </div>
    </div>
  );
}