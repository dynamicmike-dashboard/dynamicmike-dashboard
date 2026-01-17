// ... inside the Sidebar return logic ...
  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-4 space-y-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <h2 className="text-cyan-400 font-black text-xl tracking-tighter italic">GHL RESCUE</h2>
          <button onClick={onClose} className="md:hidden text-slate-500">✕</button>
        </div>

        {/* NEW DASHBOARD LINK */}
        <Link 
          href="/" 
          className="flex items-center gap-2 w-full p-2 bg-cyan-900/20 border border-cyan-800/50 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-900/40 transition-all"
        >
          <span>🏠</span> Main Dashboard
        </Link>
        
        <input 
          type="text"
          placeholder="Search sites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        />
      </div>
// ... rest of the nav and New Rescue button ...