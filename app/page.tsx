export default function LandingPage() {
  const sites = [
    { id: 'breath-of-life', name: 'Breath of Life PDC' },
    // Add more sites here as you rescue them
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-white p-10 font-sans">
      <header className="max-w-4xl mx-auto mb-20 text-center">
        <h1 className="text-5xl font-black italic tracking-tighter text-cyan-400 mb-4">
          AURA DYNAMIC
        </h1>
        <p className="text-slate-400 text-lg">Multi-Site Rescue & Hosting Dashboard</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {sites.map((site) => (
          <div key={site.id} className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500 transition-all">
            <h2 className="text-2xl font-bold mb-4">{site.name}</h2>
            <div className="flex gap-4">
              <a href={`/${site.id}`} className="text-sm bg-cyan-600 px-4 py-2 rounded-lg font-bold hover:bg-cyan-500 transition-colors">
                Visit Site
              </a>
              <a href={`/admin/dashboard/${site.id}`} className="text-sm border border-slate-700 px-4 py-2 rounded-lg text-slate-400 hover:text-white">
                Admin Dashboard
              </a>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}