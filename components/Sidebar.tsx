import Link from 'next/link';

export default function Sidebar() {
  // Manual list for Vercel/Cloud visibility
  const sites = [
    "breath-of-life",
    "fifeart",
    "inspiringspeakerspdc",
    "louisevandervelde",
    "maistermind",
    "pdcyes",
    "playaphotos",
    "playavida",
    "pranatowers",
    "realaicasa",
    "reallifeavengers"
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-cyan-400 font-black text-xl tracking-tighter italic">AURA ADMIN</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-2">Rescue Sites</p>
        {sites.map(site => (
          <Link 
            key={site} 
            href={`/admin/dashboard/${site}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all group border border-transparent hover:border-slate-700"
          >
            <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all" />
            <span className="capitalize">{site.replace(/-/g, ' ')}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
         <Link href="/" className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-2">
           <span>←</span> Back to Home
         </Link>
      </div>
    </div>
  );
}