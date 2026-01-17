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
    } catch (err) { alert("Load failed"); }
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
      alert("Saved & Pushed!");
      setIsEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      <header className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <div>
            <h1 className="text-sm font-bold text-slate-200 capitalize">{siteId.replace(/-/g, ' ')}</h1>
            <p className="text-[10px] text-slate-500 font-mono">{currentFile}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={isEditing ? () => setIsEditing(false) : loadFileContent}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold"
          >
            {isEditing ? "View Site" : "Edit HTML"}
          </button>
          {isEditing && (
            <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 rounded-lg text-xs font-bold">
              SAVE & PUSH
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 bg-white relative">
        {isEditing ? (
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="html"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
          />
        ) : (
          <iframe src={fileSrc} className="w-full h-full border-none" key={currentFile} />
        )}
      </div>
    </div>
  );
}