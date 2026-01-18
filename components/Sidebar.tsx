"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Update this list whenever you add a new site to middleware
 const sites = [
  { id: "breath-of-life", label: "Breath of Life", domain: "breathoflifepdc.org" },
  { id: "inspiringspeakerspdc", label: "InspiringSpeakersPDC", domain: "inspiringspeakerspdc.com" },
  { id: "maistermind", label: "mAIstermind", domain: "maistermind.com" },
  { id: "pdcyes", label: "PDCYES", domain: "pdcyes.com" },
  { id: "playaphotos", label: "Playa Photos", domain: "playa.photos" },
  { id: "playavida", label: "PlayaVida", domain: "playavida.org" },
  { id: "celestial-sign-design", label: "Celestial Sign", domain: "celestialsigndesign.com" },
  { id: "chatallday", label: "Chat All Day", domain: "chatall.day" },
  { id: "chillmasterscotland", label: "Chillmaster Scotland", domain: "chillmasterscotland.com" },
  { id: "consciousshifts", label: "Conscious Shifts", domain: "consciousshifts.co.uk" },
  { id: "fifeart", label: "FifeArt", domain: "fifeart.com" },
  { id: "louisevandervelde", label: "Louise VDV", domain: "louisevandervelde.com" },
  { id: "pranatowers", label: "PranaTowers", domain: "pranatowers.com" },
  { id: "reallifeavengers", label: "RealLifeAvengers", domain: "reallifeavengers.com" },
  { id: "realaicasas", label: "RealAi casa", domain: "realaicasa.com" },
  { id: "smms", label: "SMMS", domain: "social-media-management-services.com" },
 { id: "nahuala", label: "Nahuala", domain: "nahuala.bio" },

];

  const filteredSites = sites.filter(site => 
    site.id.toLowerCase().includes(search.toLowerCase()) || 
    site.domain.toLowerCase().includes(search.toLowerCase())
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
      <div className="p-4 space-y-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <h2 className="text-cyan-400 font-black text-xl tracking-tighter italic uppercase">GHL Rescue</h2>
          <button onClick={onClose} className="md:hidden text-slate-500">✕</button>
        </div>

        <Link 
          href="/" 
          className="flex items-center gap-2 w-full p-2 bg-cyan-900/20 border border-cyan-800/50 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-900/40 transition-all"
        >
          <span>🏠</span> Main Dashboard
        </Link>
        
        <input 
          type="text"
          placeholder="Search sites or domains..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        />
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-2">
    {search ? `Results (${filteredSites.length})` : "Active Projects"}
  </p>
  
  {filteredSites.map(site => (
    <div key={site.id} className="group flex flex-col p-1 rounded-lg hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-800">
      <div className="flex items-center justify-between px-2 py-1">
        {/* Use site.label for the display name */}
        <span className="text-sm font-medium text-slate-300 truncate">{site.label}</span>
      </div>
      
      <div className="flex gap-1 mt-1">
        <Link 
          href={`/admin/dashboard/${site.id}`} // Uses the lowercase ID for the URL
          onClick={onClose}
          className="flex-1 text-[10px] font-bold text-center py-1.5 bg-slate-800 text-slate-400 rounded hover:bg-cyan-600 hover:text-white transition-all"
        >
          EDIT
        </Link>
        <a 
          href={`https://${site.domain}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-[10px] font-bold text-center py-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white transition-all"
        >
          VIEW LIVE
        </a>
      </div>
    </div>
  ))}
</nav>

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