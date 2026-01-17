import Link from 'next/link';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const sites = [
    "breath-of-life", "fifeart", "inspiringspeakerspdc", 
    "louisevandervelde", "maistermind", "pdcyes", 
    "playaphotos", "playavida", "pranatowers", 
    "realaicasa", "reallifeavengers"
  ];

  const handleNewRescue = () => {
    const siteName = prompt("Enter the new Site Folder name (e.g., my-new-site):");
    if (siteName) {
      alert("Folder creation is a PC-only task. Please create 'public/content/" + siteName + "' on your F: drive.");
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-cyan-400 font-black text-xl italic">GHL RESCUE</h2>
        <button onClick={onClose} className="md:hidden text-slate-500 p-2">✕</button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sites.map(site => (
          <Link 
            key={site} 
            href={`/admin/dashboard/${site}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800 active:bg-slate-700 transition-colors capitalize"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            {site.replace(/-/g, ' ')}
          </Link>
        ))}
      </nav>

      <div className="p-4 bg-slate-900/50 border-t border-slate-800">
        <button 
          onClick={handleNewRescue}
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
        >
          <span className="text-xl">+</span> New Rescue
        </button>
      </div>
    </div>
  );
}