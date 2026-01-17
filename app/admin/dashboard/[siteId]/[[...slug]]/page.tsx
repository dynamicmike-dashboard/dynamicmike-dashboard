"use client";

import { useState, useEffect, use } from 'react';
import Editor from "@monaco-editor/react";

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default function AdminDashboardPage(props: { params: Params }) {
  const params = use(props.params);
  const siteId = params.siteId;
  const initialSlug = params.slug;

  const [currentFile, setCurrentFile] = useState(initialSlug ? `${initialSlug.join('/')}.html` : 'index.html');
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Construct the path for the iframe and the editor
  const fileSrc = `/content/${siteId}/${currentFile}`;

  const loadFileContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(fileSrc);
      const text = await res.text();
      setCode(text);
      setIsEditing(true);
    } catch (err) {
      alert("Could not load file content.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, fileName: currentFile, code }),
    });

    if (res.ok) {
      alert("Saved successfully!");
      setIsEditing(false);
    } else {
      alert("Error saving file to drive.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shadow-xl z-10">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-600/20 p-2 rounded-lg">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-200 uppercase tracking-widest leading-none mb-1">Editing Site</h1>
            <p className="text-xl font-black text-white capitalize leading-none">{siteId.replace(/-/g, ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">path: {currentFile}</span>
          
          <button 
            onClick={isEditing ? () => setIsEditing(false) : loadFileContent}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isEditing ? 'bg-slate-700 text-white' : 'bg-cyan-600/10 text-cyan-400 border border-cyan-600/30 hover:bg-cyan-600 hover:text-white'}`}
          >
            {isEditing ? "Back to Preview" : "Edit HTML"}
          </button>

          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-black hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "SAVING..." : "SAVE CHANGES"}
            </button>
          )}
          
          <a href="/" className="ml-4 p-2 text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </a>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {isEditing ? (
          <Editor
            height="100%"
            theme="vs-dark"
            path={currentFile}
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
            className="w-full h-full border-none shadow-inner" 
            title="Live Preview" 
            key={currentFile} 
          />
        )}
      </div>
    </div>
  );
}