import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default function AdminSidebar() {
  // Get all site folders from public/content
  const contentDir = path.join(process.cwd(), 'public', 'content');
  const siteFolders = fs.readdirSync(contentDir).filter(file => 
    fs.statSync(path.join(contentDir, file)).isDirectory()
  );

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-cyan-400 font-black tracking-tighter text-xl">GHL RESCUE</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">Your Sites</p>
        {siteFolders.map(folder => (
          <Link 
            key={folder} 
            href={`/admin/dashboard/${folder}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
            <span className="capitalize">{folder.replace(/-/g, ' ')}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link href="/api/media-rescue" className="block px-3 py-2 text-xs text-slate-500 hover:text-cyan-400">Media Library</Link>
        <button className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:text-cyan-400">Global Settings</button>
      </div>
    </div>
  );
}