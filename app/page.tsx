"use client";

import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [sites, setSites] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/get-sites').then(res => res.json()).then(setSites);
  }, []);

  const filteredSites = sites.filter(s => 
    s.toLowerCase().replace(/-/g, ' ').includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-950 min-h-screen text-white p-10 font-sans">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-6xl font-black text-cyan-400 italic tracking-tighter mb-8">AURA DYNAMIC</h1>
        <div className="relative max-w-md mx-auto">
          <input 
            type="text"
            placeholder="Search rescued sites..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-4 text-xs font-mono text-cyan-600 bg-cyan-950/30 px-2 py-1 rounded">
            {filteredSites.length} MATCHING
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* THIS IS THE KEY: We map over filteredSites, not 'sites' */}
        {filteredSites.map((folderId) => (
          <div key={folderId} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl hover:border-cyan-500 transition-all group">
            <h2 className="text-2xl font-bold mb-6 capitalize">{folderId.replace(/-/g, ' ')}</h2>
            <div className="flex flex-col gap-3">
              <a href={`/view/${folderId}`} className="bg-cyan-600 px-6 py-3 rounded-xl font-bold text-center hover:bg-cyan-500 shadow-lg shadow-cyan-900/20">
                Visit Public Site
              </a>
              <a href={`/admin/dashboard/${folderId}`} className="border border-slate-700 px-6 py-3 rounded-xl text-slate-400 text-center hover:bg-slate-800">
                Open Admin Dashboard
              </a>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}