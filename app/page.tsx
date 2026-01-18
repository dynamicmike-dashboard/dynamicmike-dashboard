"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [search, setSearch] = useState("");

  const sites = [
  { id: "Breath of Life", domain: "breathoflifepdc.org" }, // Example: Adjust to your actual domain

{ id: "InspiringSpeakersPDC", domain: "inspiringspeakerspdc.com" },

{ id: "mAIstermind", domain: "maistermind.com" },

{ id: "PDCYES", domain: "pdcyes.com" },

{ id: "Playa Photos", domain: "playa.photos" },

  { id: "PlayaVida", domain: "playavida.org" }, // Note the .org
  { id: "Celestial Sign", domain: "celestialsigndesign.com" },

{ id: "Chat All Day", domain: "chatall.day" },

{ id: "Chillmaster Scotland", domain: "chillmasterscotland.com" },

{ id: "Conscious Shifts", domain: "consciousshifts.co.uk" },

{ id: "FifeArt", domain: "fifeart.com" },

{ id: "Louise VDV", domain: "louisevandervelde.com" },

  { id: "PranaTowers", domain: "pranatowers.com" },

  { id: "RealLifeAvengers", domain: "reallifeavengers.com" },

{ id: "RealAi casa", domain: "realaicasa.com" },

{ id: "SMMS", domain: "social-media-management-services.com" },
 ];

  const filtered = sites.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    s.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 italic">GHL RESCUE</h1>
          <p className="text-slate-500 font-medium">Command Center & Site Manager</p>
        </div>
        
        <input 
          type="text"
          placeholder="Search your empire..."
          className="w-full md:w-96 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-cyan-100 focus:outline-none focus:border-cyan-500 transition-all"
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(site => (
          <div key={site.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all group shadow-xl">
            <h3 className="text-xl font-bold capitalize mb-1 group-hover:text-cyan-400 transition-colors">
              {site.id.replace(/-/g, ' ')}
            </h3>
            <p className="text-xs text-slate-500 font-mono mb-6">{site.domain}</p>
            
            <div className="flex gap-3">
              <Link 
                href={`/admin/dashboard/${site.id}`}
                className="flex-1 bg-slate-800 hover:bg-cyan-600 text-white text-center py-2 rounded-lg text-xs font-black transition-all"
              >
                MANAGE
              </Link>
              <a 
                href={`https://${site.domain}`}
                target="_blank"
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