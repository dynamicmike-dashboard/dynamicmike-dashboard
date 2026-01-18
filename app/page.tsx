"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleBulkRescue = async () => {
    const confirm = window.confirm("This will scan ALL pages of ALL 17 sites and download all images to your F: drive. Proceed?");
    if (!confirm) return;

    setLoading(true);
    for (const site of sites) {
      try {
        const listRes = await fetch(`/api/list-files?siteId=${site.id}`);
        const { files } = await listRes.json();

        for (const fileName of files) {
          const fileRes = await fetch(`/content/${site.id}/${fileName}`);
          const htmlContent = await fileRes.text();

          const rescueRes = await fetch('/api/media-rescue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: site.id, htmlContent }),
          });
          
          const data = await rescueRes.json();
          
          if (data.success && data.count > 0) {
            await fetch('/api/save-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ siteId: site.id, fileName, code: data.updatedHtml }),
            });
            console.log(`✅ Rescued ${data.count} images in ${site.id}/${fileName}`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed to bulk rescue: ${site.label}`, err);
      }
    }
    setLoading(false);
    alert("Bulk Deep Rescue Complete!");
  };

  const filtered = sites.filter(s => 
    s.label.toLowerCase().includes(search.toLowerCase()) || 
    s.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 italic">GHL RESCUE</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Command Center</p>
            <button 
              onClick={handleBulkRescue}
              disabled={loading}
              className="bg-amber-600/10 border border-amber-500/50 text-amber-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? "⚡ Scanning Empire..." : "⚡ Bulk Deep Rescue"}
            </button>
          </div>
        </div>
        
        <input 
          type="text"
          placeholder="Search your empire..."
          className="w-full md:w-96 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-cyan-100 focus:outline-none focus:border-cyan-500 transition-all shadow-2xl"
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(site => (
          <div key={site.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all group shadow-xl flex flex-col">
            <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">
              {site.label}
            </h3>
            <p className="text-xs text-slate-500 font-mono mb-6 truncate">{site.domain}</p>
            
            <div className="flex gap-3 mt-auto">
              <Link 
                href={`/admin/dashboard/${site.id}`}
                className="flex-1 bg-slate-800 hover:bg-cyan-600 text-white text-center py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tighter"
              >
                Manage
              </Link>
              <a 
                href={`https://${site.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-center py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tighter"
              >
                Live Site
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}