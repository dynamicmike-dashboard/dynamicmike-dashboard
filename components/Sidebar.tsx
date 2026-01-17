"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();

  // The 11 sites from your GHL Rescue project
  const sites = [
    "breath-of-life", "fifeart", "inspiringspeakerspdc", 
    "louisevandervelde", "maistermind", "pdcyes", 
    "playaphotos", "playavida", "pranatowers", 
    "realaicasa", "reallifeavengers"
  ];

  const handleNewRescue = async () => {
    const siteName = prompt("Name your new rescue folder (e.g. fife-art):");
    if (!siteName) return;

    const siteId = siteName.toLowerCase().replace(/\s+/g, '-');

    try {
      const res = await fetch('/api/create-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: siteId }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Folder 'public/content/${siteId}' created!`);
        if (onClose) onClose();
        router.push(`/admin/dashboard/${siteId}`);
        router.refresh();
      } else {
        alert("Creation failed: " + data.error);
      }
    } catch (err) {
      alert("Error: Ensure your local PC is running 'npm run dev'");
    }
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
      {/* BRANDING */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-cyan-400 font-black text-xl tracking-tighter">GHL RESCUE</h2>
        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white text-xl">✕</button>
      </div>
      
      {/* SITE LIST */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-2">Your Sites</p>
        {sites.map(site => (
          <Link 
            key={site} 
            href={`/admin/dashboard/${site}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-all group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyan-500 shadow-cyan-500/50 group-hover:shadow-[0_0_8px]" />
            <span className="capitalize">{site.replace(/-/g, ' ')}</span>
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
          <Link href="/api/media-rescue" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-white">
            <span>🖼️</span> Media Library
          </Link>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-white w-full text-left">
            <span>⚙️</span> Global Settings
          </button>
        </div>
      </nav>

      {/* ACTION BUTTON */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <button 
          onClick={handleNewRescue}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> New Rescue
        </button>
      </div>
    </div>
  );
}