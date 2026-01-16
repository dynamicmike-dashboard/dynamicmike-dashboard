"use client";

import { useState, useEffect } from 'react';

// We use a small 'Action' to get the folders since 'use client' can't use 'fs' directly
async function getFolders() {
  const res = await fetch('/api/get-sites');
  if (!res.ok) return [];
  return res.json();
}

export default function LandingPage() {
  const [sites, setSites] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getFolders().then(setSites);
  }, []);

  const filteredSites = sites.filter(s => 
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col items-center p-10 font-sans">
      <header className="mb-12 text-center w-full max-w-4xl">
        <h1 className="text-6xl font-black text-cyan-400 italic tracking-tighter mb-6">AURA DYNAMIC</h1>
        
        {/* THE SEARCH BAR */}
        <div className="relative max-w-md mx-auto">
          <input 
            type="text"
            placeholder="Search rescued sites..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-4 text-slate-500">
            {filteredSites.length} found
          </div>
        </div>
      </header>
      
      <main className="grid gap-6 w-full max-w-4xl grid-cols-1 md:grid-cols-2">
        {filteredSites.map((folderId) => (
          <div key={folderId} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl hover:border-cyan-500/50 transition-all group">
            <h2 className="text-2xl font-bold mb-4 capitalize">{folderId.replace(/-/g, ' ')}</h2>
            <div className="flex flex-col gap-3">
              <a href={`/view/${folderId}`} className="bg-cyan-600 px-6 py-3 rounded-xl font-bold text-center hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20">
                Visit Public Site
              </a>
              <a href={`/admin/dashboard/${folderId}`} className="border border-slate-700 px-6 py-3 rounded-xl text-slate-400 text-center hover:bg-slate-800 transition-colors">
                Open Admin Dashboard
              </a>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}