"use client";

import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [sites, setSites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-sites')
      .then(res => res.json())
      .then(data => {
        setSites(data);
        setLoading(false);
      });
  }, []);

  // Use this for the search logic
  const filteredSites = sites.filter(s => 
    s.toLowerCase().replace(/-/g, ' ').includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col items-center p-10 font-sans">
      <header className="mb-12 text-center w-full max-w-4xl">
        <h1 className="text-6xl font-black text-cyan-400 italic tracking-tighter mb-6">AURA DYNAMIC</h1>
        
        <div className="relative max-w-md mx-auto">
          <input 
            type="text"
            placeholder="Search rescued sites..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-5 text-xs font-mono text-cyan-500 uppercase tracking-widest">
            {loading ? "Scanning..." : `${filteredSites.length} found`}
          </div>
        </div>
      </header>
      
      {/* Ensure this grid is outside the header but inside the main div */}
      <main className="grid gap-6 w-full max-w-4xl grid-cols-1 md:grid-cols-2">
        {filteredSites.map((folderId) => (
          <div key={folderId} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl border-l-4 border-l-cyan-600 hover:border-cyan-500 transition-all">
            <h2 className="text-2xl font-bold mb-4 capitalize">{folderId.replace(/-/g, ' ')}</h2>
            <div className="flex flex-col gap-3">
              <a href={`/view/${folderId}`} className="bg-cyan-600 px-6 py-3 rounded-xl font-bold text-center hover:bg-cyan-500 transition-colors">
                Visit Public Site
              </a>
              <a href={`/admin/dashboard/${folderId}`} className="border border-slate-700 px-6 py-3 rounded-xl text-slate-400 text-center hover:bg-slate-800">
                Open Admin Dashboard
              </a>
            </div>
          </div>
        ))}

        {/* This appears if you search for something that doesn't exist */}
        {!loading && filteredSites.length === 0 && (
          <div className="col-span-full text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No sites match "{search}"</p>
          </div>
        )}
      </main>
    </div>
  );
}