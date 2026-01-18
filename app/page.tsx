"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [search, setSearch] = useState("");

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

  const filtered = sites.filter(s => 
    s.label.toLowerCase().includes(search.toLowerCase()) || 
    s.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 italic">GHL RESCUE</h1>
          <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Command Center</p>
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
                className="flex-1 bg-slate-800 hover:bg-cyan-600 text-white text-center py-2 rounded-lg text-xs font-black transition-all"
              >
                MANAGE
              </Link>
              <a 
                href={`https://${site.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-center py-2 rounded-lg text-xs font-black transition-all"
              >
                LIVE SITE
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}