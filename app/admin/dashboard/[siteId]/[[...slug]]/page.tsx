"use client";

import { useState, useEffect, use } from 'react';
import Editor from "@monaco-editor/react";

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default function AdminDashboardPage(props: { params: Params }) {
  const params = use(props.params);
  const siteId = params.siteId;
  const slug = params.slug;

  const [fileName, setFileName] = useState("index.html");
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug && slug.length > 0) {
      setFileName(`${slug.join('/')}.html`);
    } else {
      setFileName("index.html");
    }
  }, [slug]);

  const iframeSrc = `/content/${siteId}/${fileName}`;

  const toggleEditor = async () => {
    if (!isEditing) {
      setLoading(true);
      try {
        const res = await fetch(iframeSrc);
        const text = await res.text();
        setCode(text);
      } catch (err) {
        console.error("Failed to load file for editing");
      }
      setLoading(false);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setLoading(true);
    // This calls the Save API we will build next
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, fileName, code }),
    });

    if (res.ok) {
      alert("Changes saved to local file!");
      setIsEditing(false);
    } else {
      alert("Error saving file. Check your local server terminal.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-cyan-400 capitalize">{siteId.replace(/-/g, ' ')}</h1>
            <p className="text-[10px] text-slate-500 font-mono italic">{fileName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleEditor}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all"
          >
            {isEditing ? "Cancel" : "Edit Code"}
          </button>
          
          {isEditing ? (
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 rounded-lg text-xs font-bold hover:bg-cyan-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <a 
              href={`/view/${siteId}`} 
              target="_blank" 
              className="px-4 py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg text-xs font-bold hover:bg-cyan-800"
            >
              View Live Site
            </a>
          )}
          <a href="/" className="text-xs text-slate-500 hover:text-white ml-4">Exit</a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white relative">
        {isEditing ? (
          <Editor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        ) : (
          <iframe src={iframeSrc} className="w-full h-full border-none" title="Preview" />
        )}
      </div>
    </div>
  );
}