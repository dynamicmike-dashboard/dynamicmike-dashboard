"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();

  // Hard-coded list for Vercel visibility
  const sites = [
    "breath-of-life", "fifeart", "inspiringspeakerspdc", 
    "louisevandervelde", "maistermind", "pdcyes", 
    "playaphotos", "playavida", "pranatowers", 
    "realaicasa", "reallifeavengers"
  ];

  const handleNewRescue = async () => {
    const siteName = prompt("Enter the name for your new site (e.g., My New Project):");
    if (!siteName) return;

    // Standardize the ID (e.g., "My New Project" -> "my-new-project")
    const siteId = siteName.toLowerCase().replace(/\s+/g, '-');

    try {
      const res = await fetch('/api/create-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: siteId }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Success! Folder created at public/content/${siteId}`);
        if (onClose) onClose(); // Close mobile menu
        router.push(`/admin/dashboard/${siteId}`);
        router.refresh();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to the creation API. Ensure 'npm run dev' is active.");
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-slate-800/50">
        <h2 className="text-cyan-400 font-black text-xl italic tracking-tighter">GHL RESCUE</h2>
        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white p-2">✕</button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-black px-3 mb-4">Active Projects</p>
        {sites.map(site => (
          <Link 
            key={site} 
            href={`/admin/dashboard/${site}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800 active:bg-slate-700 transition-all capitalize border border-transparent hover:border-slate-700/50"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
            {site.replace(/-/g, ' ')}
          </Link>
        ))}
      </nav>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
        <button 
          onClick={handleNewRescue}
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/40 uppercase text-xs tracking-widest"
        >
          <span className="text-lg">+</span> New Rescue
        </button>
      </div>
    </div>
  );
}