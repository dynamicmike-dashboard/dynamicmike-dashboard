import fs from 'fs';
import path from 'path';

export default function LandingPage() {
  // Get the path to the public/content directory
  const contentDir = path.join(process.cwd(), 'public', 'content');
  
  // Read the directory and filter for folders only
  let siteFolders: string[] = [];
  try {
    siteFolders = fs.readdirSync(contentDir).filter((file) => {
      return fs.statSync(path.join(contentDir, file)).isDirectory();
    });
  } catch (error) {
    console.error("Content directory not found:", error);
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col items-center p-10 font-sans">
      <header className="mb-16 text-center">
        <h1 className="text-6xl font-black text-cyan-400 italic tracking-tighter">AURA DYNAMIC</h1>
        <p className="text-slate-500 mt-2 font-mono uppercase tracking-widest text-xs">Automated Rescue Directory</p>
      </header>
      
      <main className="grid gap-6 w-full max-w-4xl grid-cols-1 md:grid-cols-2">
        {siteFolders.map((folderId) => (
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