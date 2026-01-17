"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const sites = [
    "breath-of-life", "fifeart", "inspiringspeakerspdc", 
    "louisevandervelde", "maistermind", "pdcyes", 
    "playaphotos", "playavida", "pranatowers", 
    "realaicasa", "reallifeavengers"
  ];

  // Filter sites based on search input
  const filteredSites = sites.filter(site => 
    site.toLowerCase().includes(search.toLowerCase())
  );

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
        if (onClose) onClose();
        router.push(`/admin/dashboard/${siteId}`);
        router.refresh();
      }
    } catch (err) { alert("PC must be running 'npm run dev'"); }
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* BRANDING & SEARCH */}
      <div className="p-4 space-y-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <h2 className="text-cyan-400 font-black text-xl tracking-tighter">GHL RESCUE</h2>
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white">✕</button>
        </div>
        
        <div className="relative group">
          <input 
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          <span className="absolute right-3 top-2.5 text-slate-600 text-[10px] group-focus-within:hidden">⌘K</span>
        </div>
      </div>
      
      {/* SITE LIST */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-2">
          {search ? `Results (${filteredSites.length})` : "Your Sites"}
        </p>
        
        {filteredSites.map(site => (
          <div key={site} className="group flex flex-col p-1 rounded-lg hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-800">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-sm font-medium text-slate-300 capitalize truncate">{site.replace(/-/g, ' ')}</span>
            </div>
            
            {/* HOVER ACTIONS */}
            <div className="flex gap-1 mt-1">
              <Link 
                href={`/admin/dashboard/${site}`}
                onClick={onClose}
                className="flex-1 text-[10px] font-bold text-center py-1.5 bg-slate-800 text-slate-400 rounded hover:bg-cyan-600 hover:text-white transition-all"
              >
                EDIT
              </Link>
              <a 
                href={`https://${site}.com`} 
                target="_blank"
                className="flex-1 text-[10px] font-bold text-center py-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white transition-all"
              >
                VIEW LIVE
              </a>
            </div>
          </div>
        ))}

        {filteredSites.length === 0 && (
          <div className="p-4 text-center text-slate-600 text-xs italic">No sites found</div>
        )}
      </nav>

      {/* ACTION BUTTON */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <button 
          onClick={handleNewRescue}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/20"
        >
          + New Rescue
        </button>
      </div>
    </div>
  );
}