"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.siteId as string;
  
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSiteId, setActiveSiteId] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

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

  const currentSite = sites.find(s => s.id === siteId);

  useEffect(() => {
    if (siteId) {
      const sid = (siteId as string).toLowerCase();
      setActiveSiteId(sid);
      loadFiles(sid);
    }
  }, [siteId]);

  const loadFiles = async (sid = activeSiteId) => {
    if (!sid) return;
    setLoading(true);
    const ts = Date.now();
    try {
      // Load root files
      const rootRes = await fetch(`/api/list-files?siteId=${sid}&t=${ts}`);
      const rootData = await rootRes.json();
      setPages(rootData.files || []);
      if (rootData.debug) setDebugInfo(rootData.debug);

      // Load posts if folder exists
      const postsRes = await fetch(`/api/list-files?siteId=${sid}&folder=post&t=${ts}`);
      const postsData = await postsRes.json();
      setPosts(postsData.files || []);
    } catch (err) {
      console.error("Failed to load files", err);
    }
    setLoading(false);
  };

  const handleNewPost = async () => {
    const postName = prompt("Enter post filename (e.g. pdcyes-march-2026):");
    if (!postName) return;
    
    // Default template for PDCYES
    const templatePath = siteId === 'pdcyes' ? 'pdcyes/post/pdcyes-february-2026.html' : null;
    
    setLoading(true);
    try {
      const res = await fetch('/api/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          siteId, 
          fileName: `post/${postName.replace('.html', '')}.html`,
          templatePath
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFiles();
        router.push(`/admin/dashboard/${siteId}/post/${postName.replace('.html', '')}`);
      } else {
        alert(data.error || "Failed to create post");
      }
    } catch (err) {
      alert("Error creating post");
    }
    setLoading(false);
  };

  const handleNewPage = async () => {
    const pageName = prompt("Enter page filename (e.g. services):");
    if (!pageName) return;
    
    // Find best template (index.html or something specific like BreathofLifePDC.html)
    const bestTemplate = pages.find(p => p.toLowerCase().includes('index') || p.toLowerCase().includes(siteId.toLowerCase())) || pages[0];

    setLoading(true);
    try {
      const res = await fetch('/api/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          siteId, 
          fileName: `${pageName.replace('.html', '')}.html`,
          templatePath: bestTemplate ? `${siteId}/${bestTemplate}` : null
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFiles();
        router.push(`/admin/dashboard/${siteId}/${pageName.replace('.html', '')}`);
      } else {
        alert(data.error || "Failed to create page");
      }
    } catch (err) {
      alert("Error creating page");
    }
    setLoading(false);
  };

  const handleClone = async (fileName: string, isPost: boolean) => {
    const newName = prompt(`Enter name for the clone of ${fileName}:`, `copy-${fileName}`);
    if (!newName) return;

    setLoading(true);
    try {
      const fullPath = isPost ? `post/${fileName}` : fileName;
      const targetName = isPost ? `post/${newName.replace('.html', '')}.html` : `${newName.replace('.html', '')}.html`;
      
      const res = await fetch('/api/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          siteId, 
          fileName: targetName,
          templatePath: `${siteId}/${fullPath}`
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFiles();
        router.push(`/admin/dashboard/${siteId}/${targetName.replace('.html', '')}`);
      } else {
        alert(data.error || "Failed to clone");
      }
    } catch (err) {
      alert("Error cloning");
    }
    setLoading(false);
  };

  if (!siteId) {
    return (
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-cyan-400 font-black text-xl tracking-tighter italic uppercase">GHL Rescue</h2>
        </div>
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-slate-500 text-xs">Select a site from the main dashboard to begin managing.</p>
          <Link href="/" className="px-4 py-2 bg-slate-800 text-cyan-400 rounded-lg text-xs font-bold hover:bg-slate-700">🏠 Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-4 space-y-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-cyan-400 font-black text-xl tracking-tighter italic uppercase leading-none">GHL Rescue</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentSite?.label}</p>
              <button 
                onClick={() => loadFiles()}
                className="text-[8px] text-cyan-500/50 hover:text-cyan-400 font-mono transition-all"
                title="Refresh Sidebar"
              >
                [REFRESH]
              </button>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500">✕</button>
        </div>

        <Link 
          href="/" 
          className="flex items-center gap-2 w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs font-bold text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 transition-all"
        >
          <span>🏠</span> Back to All Sites
        </Link>

        {/* SEARCH BAR */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* PAGES SECTION */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pages [{pages.length}]</h3>
          </div>
          {pages.length === 0 && debugInfo && (
            <div className="p-2 mb-2 bg-red-900/20 border border-red-500/20 rounded text-[9px] text-red-300 font-mono break-all">
              DEBUG: path not found: {debugInfo.dirPath}
            </div>
          )}
          <div className="space-y-1">
            {pages.filter(p => !search || p.toLowerCase().includes(search.toLowerCase())).map(file => {
              const slug = file.replace('.html', '');
              return (
                <div key={file} className="flex items-center gap-1 group">
                  <Link 
                    href={`/admin/dashboard/${siteId}/${slug}`}
                    className="flex-1 block px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
                  >
                    {file === 'index.html' ? '🏠 Home (index)' : file}
                  </Link>
                  {file !== 'index.html' && (
                    <button 
                      onClick={() => handleClone(file, false)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-cyan-400 transition-all"
                      title="Clone Page"
                    >
                      👯
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* POSTS SECTION */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Posts</h3>
            <span className="text-[10px] text-slate-600 font-mono">{posts.length}</span>
          </div>
          <div className="space-y-1">
            {posts.filter(p => !search || p.toLowerCase().includes(search.toLowerCase())).map(file => {
              const slug = file.replace('.html', '');
              return (
                <div key={file} className="flex items-center gap-1 group">
                  <Link 
                    href={`/admin/dashboard/${siteId}/post/${slug}`}
                    className="flex-1 block px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
                  >
                    📄 {file}
                  </Link>
                  <button 
                    onClick={() => handleClone(file, true)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-cyan-400 transition-all"
                    title="Clone Post"
                  >
                    👯
                  </button>
                </div>
              );
            })}
            
            {posts.length === 0 && !loading && (
              <p className="text-[10px] text-slate-600 italic px-3 py-2">No posts found in /post</p>
            )}
          </div>
        </section>
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => handleNewPage()}
            disabled={loading}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "..." : "+ New Page"}
          </button>
          <button 
            onClick={handleNewPost}
            disabled={loading}
            className="py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            {loading ? "..." : "+ New Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
