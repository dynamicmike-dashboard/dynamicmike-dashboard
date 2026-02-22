"use client";

import { useState, useEffect, use, useMemo } from 'react';
import Editor from "@monaco-editor/react";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import('react-quill-new');
  const Quill = (RQ as any).Quill;
  
  if (Quill) {
    // Register custom formats to allow style and data-wrap attributes
    const Image = Quill.import('formats/image') as any;
    class CustomImage extends Image {
      static create(value: any) {
        const node = super.create(value);
        if (typeof value === 'object') {
          if (value.style) node.setAttribute('style', value.style);
          if (value['data-wrap']) node.setAttribute('data-wrap', value['data-wrap']);
          if (value.width) node.setAttribute('width', value.width);
          if (value.height) node.setAttribute('height', value.height);
        }
        return node;
      }
      static formats(node: HTMLElement) {
        const formats = super.formats(node) || {};
        if (node.hasAttribute('style')) (formats as any).style = node.getAttribute('style');
        if (node.hasAttribute('data-wrap')) (formats as any)['data-wrap'] = node.getAttribute('data-wrap');
        if (node.hasAttribute('width')) (formats as any).width = node.getAttribute('width');
        if (node.hasAttribute('height')) (formats as any).height = node.getAttribute('height');
        return formats;
      }
      format(name: string, value: any) {
        if (['style', 'data-wrap', 'width', 'height'].includes(name)) {
          if (value) (this as any).domNode.setAttribute(name, value);
          else (this as any).domNode.removeAttribute(name);
        } else {
          super.format(name, value);
        }
      }
    }
    (CustomImage as any).blotName = 'image';
    (CustomImage as any).tagName = 'IMG';
    Quill.register(CustomImage, true);
  }

  return RQ;
}, { ssr: false });

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default function AdminDashboardPage(props: { params: Params }) {
  const params = use(props.params);
  const siteId = params.siteId;
  const slug = params.slug;

  const [currentFile, setCurrentFile] = useState(slug ? `${slug.join('/')}.html` : 'index.html');
  const [isEditing, setIsEditing] = useState(false);
  const [isVisual, setIsVisual] = useState(true); // Default to visual editor
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  
  // SEO Metadata State
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: ""
  });

  const fileSrc = `/content/${siteId}/${currentFile}`;

  // Helper to extract the editable portion of GHL-style HTML
  const getEditableContent = (html: string) => {
    const match = html.match(/<div id="blogPostContent">([\s\S]*?)<\/div><div class="blog-tags">/);
    return match ? match[1] : html;
  };

  // Helper to wrap the editable content back into the full HTML structure
  const wrapContent = (editable: string, fullHtml: string) => {
    return fullHtml.replace(/(<div id="blogPostContent">)[\s\S]*?(<\/div><div class="blog-tags">)/, `$1${editable}$2`);
  };

  const parseSEO = (html: string) => {
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="([\s\S]*?)"/);
    const keywordsMatch = html.match(/<meta name="keywords" content="(.*?)"/);

    setSeo({
      title: titleMatch ? titleMatch[1] : "",
      description: descMatch ? descMatch[1].trim() : "",
      keywords: keywordsMatch ? keywordsMatch[1] : ""
    });
  };

  const updateHTMLWithSEO = (html: string) => {
    let updated = html;
    // Update <title>
    updated = updated.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`);
    // Update meta title
    updated = updated.replace(/<meta name="title" content=".*?"/, `<meta name="title" content="${seo.title}"`);
    updated = updated.replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${seo.title}"`);
    // Update meta description
    updated = updated.replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${seo.description}"`);
    updated = updated.replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${seo.description}"`);
    // Update meta keywords
    updated = updated.replace(/<meta name="keywords" content=".*?"/, `<meta name="keywords" content="${seo.keywords}"`);
    updated = updated.replace(/<meta property="og:keywords" content=".*?"/, `<meta property="og:keywords" content="${seo.keywords}"`);
    
    // Ensure external links open in new tab
    updated = updated.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]+)"([^>]*)>/gi, (match, href, rest) => {
      if (href.startsWith('http') && !href.includes('localhost') && !href.includes('pdcyes.com') && !href.includes('realprayerbook.com')) {
        if (!rest.includes('target="_blank"')) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer"${rest}>`;
        }
      }
      return match;
    });

    return updated;
  };

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
      parseSEO(text);
      setIsEditing(true);
    } catch (err) { 
      alert("Failed to load file."); 
    }
    setLoading(false);
  };

  const handleSave = async (contentToSave?: string) => {
    setLoading(true);
    const finalContent = contentToSave || code;
    const finalCode = updateHTMLWithSEO(finalContent);
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, fileName: currentFile, code: finalCode }),
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing) {
          // If in visual mode, get text from the editor directly to be safe
          const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;
          if (isVisual && quill) {
            const currentVal = wrapContent(quill.root.innerHTML, code);
            handleSaveWithCleanup(currentVal);
          } else {
            handleSaveWithCleanup();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isVisual, code, seo]); 

  const cleanGHLTags = (html: string) => {
    return html.replace(/<!--[\s\S]*?-->/g, '').trim();
  };

  const handleSaveWithCleanup = (contentOverride?: string) => {
    const targetContent = contentOverride || code;
    const cleaned = cleanGHLTags(targetContent);
    setCode(cleaned); // Still update local state
    handleSave(cleaned); // Pass directly to avoid race conditions with state update
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

  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const handleImageUpload = async (file: File, imgElement?: HTMLImageElement) => {
    const customName = prompt("Rename image? (Leave blank for original name)", file.name.split('.')[0]);
    const folderChoice = prompt("Save to which folder? (images or img)", "images");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('siteId', siteId);
    if (customName) formData.append('customName', customName);
    formData.append('folder', folderChoice || 'images'); 

    setLoading(true);
    try {
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const finalUrl = data.url;
        
        // Use Quill API to update if possible
        const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;
        
        if (imgElement && quill) {
          // Find the image blot in the editor
          const blot = (window as any).Quill ? (window as any).Quill.find(imgElement) : null;
          if (blot) {
            blot.replaceWith('image', finalUrl);
            alert("Image replaced and synced!");
          } else {
            // Fallback for direct DOM manipulation if blot isn't found
            imgElement.src = finalUrl;
            alert("Image uploaded! (Local refresh may be needed)");
          }
        } else if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range ? range.index : 0, 'image', finalUrl);
          alert("Image inserted!");
        } else if (imgElement) {
          imgElement.src = finalUrl;
          alert("Image uploaded!");
        }

        // Force a sync of the code state
        const editor = document.querySelector('.ql-editor');
        if (editor) {
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("Error uploading image");
    }
    setLoading(false);
  };

  const handleClick = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const action = prompt("Image Actions:\n1. Upload & Replace\n2. Choose from Library\n3. Resize (Width in px)\n4. Replace via URL\n5. Float Right\n6. Float Left\n7. Clear Float\n8. Delete", "");
      
      if (!action) return;

      const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;

      if (action === "1") {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleImageUpload(file, img);
        };
        input.click();
      } else if (action === "2") {
        setLoading(true);
        try {
          const res = await fetch(`/api/list-media?siteId=${siteId}`);
          const data = await res.json();
          if (data.success && data.images.length > 0) {
            // Sort images so most recent or alphabetical are easier to find
            const sorted = data.images.sort((a: any, b: any) => a.name.localeCompare(b.name));
            const list = sorted.map((img: any, i: number) => `${i + 1}. ${img.name} (${img.folder})`).join('\n');
            const choice = prompt(`Select Image from ${siteId} library:\n\n${list}`, "1");
            const selected = sorted[parseInt(choice || "0") - 1];
            if (selected) {
              if (quill) {
                const blot = (window as any).Quill.find(img);
                if (blot) blot.replaceWith('image', selected.url);
                else img.src = selected.url;
              } else {
                img.src = selected.url;
              }
            }
          } else {
            alert("No images found in your library.");
          }
        } catch (err) {
          alert("Error loading media library");
        }
        setLoading(false);
      } else if (action === "3") {
        const width = prompt("Enter width (e.g. 400):", img.getAttribute('width') || img.style.width || "");
        if (width) {
          img.setAttribute('width', width);
          img.style.width = `${width}px`;
          img.style.height = 'auto';
        }
      } else if (action === "4") {
        const url = prompt("Enter new image URL:", img.src);
        if (url && quill) {
          const blot = (window as any).Quill.find(img);
          if (blot) blot.replaceWith('image', url);
          else img.src = url;
        } else if (url) {
          img.src = url;
        }
      } else if (action === "5") {
        img.style.float = 'right';
        img.style.marginLeft = '2rem';
        img.style.marginBottom = '2rem';
        img.setAttribute('data-wrap', 'right');
      } else if (action === "6") {
        img.style.float = 'left';
        img.style.marginRight = '2rem';
        img.style.marginBottom = '2rem';
        img.setAttribute('data-wrap', 'left');
      } else if (action === "7") {
        img.style.float = 'none';
        img.style.margin = '0 auto';
        img.removeAttribute('data-wrap');
      } else if (action === "8") {
        if (confirm("Delete this image?")) img.remove();
      }
      
      // Force Quill update
      const editor = document.querySelector('.ql-editor');
      if (editor) {
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
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
            <>
              <div className="flex bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700">
                <button 
                  onClick={() => setIsVisual(true)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isVisual ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  VISUAL
                </button>
                <button 
                  onClick={() => setIsVisual(false)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isVisual ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  SOURCE
                </button>
              </div>

              <button 
                onClick={() => setShowSEO(!showSEO)}
                className={`px-3 py-2 border rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${
                  showSEO 
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-400'
                }`}
              >
                SEO Settings
              </button>

              <button 
                onClick={handleMediaRescue}
                disabled={loading}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-cyan-400 hover:bg-slate-700 transition-all uppercase tracking-widest"
              >
                {loading ? "..." : "Rescue Media"}
              </button>
            </>
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
              onClick={handleSaveWithCleanup}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-black hover:bg-cyan-400 disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {loading ? "SAVING..." : "SAVE & PUSH"}
            </button>
          )}
        </div>
      </header>

      {/* EDITOR / IFRAME AREA */}
      <div className="flex-1 flex overflow-hidden bg-white relative">
        <div className={`flex-1 relative transition-all duration-300 ${showSEO ? 'mr-80' : ''}`}>
          {isEditing ? (
            isVisual ? (
              <div className="h-full px-4 py-8 max-w-4xl mx-auto shadow-inner bg-slate-300 min-h-screen overflow-hidden">
                <div className="bg-white border border-slate-300 shadow-xl rounded-xl h-full flex flex-col overflow-hidden" onClick={handleClick}>
                  <ReactQuill 
                    theme="snow"
                    defaultValue={getEditableContent(code)}
                    onChange={(val) => {
                      const wrapped = wrapContent(val, code);
                      if (wrapped !== code) setCode(wrapped);
                    }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }, { 'align': [] }],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video'],
                        ['clean']
                      ],
                    }}
                    className="quill-light-fix flex-1 flex flex-col overflow-hidden"
                  />
                </div>
                <style jsx global>{`
                  .quill-light-fix {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                  }
                  .quill-light-fix .ql-toolbar {
                    background-color: #f8fafc !important;
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    flex-shrink: 0 !important;
                    z-index: 50 !important;
                    box-shadow: 0 2px 4px rgb(0 0 0 / 0.05) !important;
                  }
                  .quill-light-fix .ql-container {
                    border: none !important;
                    flex: 1 1 auto !important;
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                  }
                  .quill-light-fix .ql-editor {
                    color: #1e293b !important;
                    background-color: #fff !important;
                    flex: 1 1 auto !important;
                    overflow-y: auto !important;
                    font-size: 16px !important;
                    line-height: 1.6 !important;
                    padding: 60px !important;
                  }
                  .quill-light-fix .ql-editor img {
                    max-width: 100% !important;
                    height: auto !important;
                    cursor: pointer !important;
                    transition: outline 0.2s ease !important;
                  }
                  .quill-light-fix .ql-editor img:hover {
                    outline: 2px solid #06b6d4 !important;
                  }
                  .quill-light-fix .ql-editor img:active {
                    outline: 4px solid #06b6d4 !important;
                  }
                  .quill-light-fix .ql-editor img[style*="float: right"],
                  .quill-light-fix .ql-editor img[data-wrap="right"] {
                    float: right !important;
                    margin-left: 2rem !important;
                    margin-bottom: 2rem !important;
                    display: block !important;
                    clear: none !important;
                  }
                  .quill-light-fix .ql-editor img[style*="float: left"],
                  .quill-light-fix .ql-editor img[data-wrap="left"] {
                    float: left !important;
                    margin-right: 2rem !important;
                    margin-bottom: 2rem !important;
                    display: block !important;
                    clear: none !important;
                  }
                  /* High-contrast fix for white text in light theme */
                  .quill-light-fix .ql-editor [style*="color: rgb(255, 255, 255)"],
                  .quill-light-fix .ql-editor [style*="color: #fff"],
                  .quill-light-fix .ql-editor [style*="color: white"] {
                    background-color: #1e293b !important;
                    padding: 2px 4px !important;
                    border-radius: 4px !important;
                  }
                  .quill-light-fix .ql-editor p {
                    clear: none !important;
                    margin-bottom: 1rem !important;
                  }
                  /* Alignment classes support */
                  .quill-light-fix .ql-align-center { text-align: center !important; }
                  .quill-light-fix .ql-align-right { text-align: right !important; }
                  .quill-light-fix .ql-align-justify { text-align: justify !important; }
                  
                  .quill-light-fix .ql-editor::after {
                    content: "";
                    display: table;
                    clear: both;
                  }
                `}</style>
              </div>
            ) : (
              <Editor
                height="100%"
                theme="light"
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
            )
          ) : (
            <iframe 
              src={fileSrc} 
              className="w-full h-full border-none" 
              title="Live Preview"
              key={currentFile} 
            />
          )}
        </div>

        {/* SEO SIDEBAR */}
        {isEditing && showSEO && (
          <aside className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">SEO Metadata</h2>
              <button onClick={() => setShowSEO(false)} className="text-slate-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="6 18L18 6M6 6l18 18"></path></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Meta Title</label>
                <input 
                  type="text" 
                  value={seo.title}
                  onChange={(e) => setSeo({...seo, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Enter page title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Meta Description</label>
                <textarea 
                  rows={4}
                  value={seo.description}
                  onChange={(e) => setSeo({...seo, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  placeholder="Enter meta description..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Keywords</label>
                <input 
                  type="text" 
                  value={seo.keywords}
                  onChange={(e) => setSeo({...seo, keywords: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="e.g. blog, travel, marketing..."
                />
              </div>

                <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                  <p className="text-[10px] text-cyan-400/70 leading-relaxed">
                    <strong className="text-cyan-400 block mb-1 uppercase tracking-tighter">SEO Suggestion</strong>
                    Based on your site profile, use keywords like: <br/>
                    <span className="text-slate-200 mt-1 block">
                      {siteId.replace(/-/g, ', ')}, {currentFile.replace('.html', '').replace(/-/g, ', ')}
                    </span>
                  </p>
                </div>
              </div>
          </aside>
        )}
      </div>
    </div>
  );
}
