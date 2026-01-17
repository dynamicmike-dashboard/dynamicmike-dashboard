"use client";

import { useState, useEffect, use } from 'react';
import Editor from "@monaco-editor/react";

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default function AdminDashboardPage(props: { params: Params }) {
  const params = use(props.params);
  const siteId = params.siteId;
  const slug = params.slug;

  const [currentFile, setCurrentFile] = useState(slug ? `${slug.join('/')}.html` : 'index.html');
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const fileSrc = `/content/${siteId}/${currentFile}`;

  useEffect(() => {
    if (slug && slug.length > 0) {
      setCurrentFile(`${slug.join('/')}.html`);
    } else {
      setCurrentFile("index.html");
    }
  }, [slug]);

  const loadFileContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(fileSrc);
      const text = await res.text();
      setCode(text);
      setIsEditing(true);
    } catch (err) { 
      alert("Failed to load file."); 
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, fileName: currentFile, code }),
      });
      if (res.ok) {
        alert("Saved to F: drive and pushed to GitHub!");
        setIsEditing(false);
      } else {
        alert("Save failed. Make sure 'npm run dev' is running on your PC.");
      }
    } catch (err) {
      alert("Network error. Check your local connection.");
    }
    setLoading(false);
  };

  const handleMediaRescue = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch('/api/media-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, htmlContent: code }),
      });
      const data = await res.json();
      if (data.success) {
        setCode(data.updatedHtml);
        alert(`Rescued ${data.count} images! Remember to click SAVE to finalize.`);
      } else {
        alert("Media rescue failed.");
      }
    } catch (err) {
      alert("Error connecting to Media Rescue API.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* HEADER BAR */}
      <header className="p-4 flex flex-col sm:flex-row justify-between items-center bg-slate-900 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div>
          <div>
            <h1 className="text-sm font-black text-slate-200 capitalize tracking-tight">{siteId.replace(/-/g, ' ')}</h1>
            <p className="text-[10px] text-slate-500 font-mono italic">{currentFile}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isEditing && (
            <button 
              onClick={handleMediaRescue}
              disabled={loading}
              className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-cyan-400 hover:bg-slate-700 transition-all uppercase tracking-widest"
            >
              {loading ? "..." : "Rescue Media"}
            </button>
          )}
          
          <button 
            onClick={isEditing ? () => setIsEditing(false) : loadFileContent}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              isEditing 
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                : 'bg-cyan-600/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-600 hover:text-white'
            }`}
          >
            {isEditing ? "Back to Preview" : "Edit HTML"}
          </button>
          
          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-black hover:bg-cyan-400 disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {loading ? "SAVING..." : "SAVE & PUSH"}
            </button>
          )}
        </div>
      </header>

      {/* EDITOR / IFRAME AREA */}
      <div className="flex-1 bg-white relative">
        {isEditing ? (
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="html"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ 
              fontSize: 14, 
              minimap: { enabled: false },
              wordWrap: "on",
              padding: { top: 20 }
            }}
          />
        ) : (
          <iframe 
            src={fileSrc} 
            className="w-full h-full border-none" 
            title="Live Preview"
            key={currentFile} 
          />
        )}
      </div>
    </div>
  );
}