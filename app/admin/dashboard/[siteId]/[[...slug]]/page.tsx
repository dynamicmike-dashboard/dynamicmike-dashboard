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
    keywords: "",
    image: ""
  });
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<any[]>([]);
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedImgRef, setSelectedImgRef] = useState<HTMLImageElement | null>(null);
  const [editorKey, setEditorKey] = useState(0); 
  const [gitStatus, setGitStatus] = useState<{ success: boolean; log: string; debug?: any } | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(true);

  const fileSrc = `/content/${siteId}/${currentFile}`;

  // Helper to extract the editable portion of GHL-style HTML
  const getEditableContent = (html: string) => {
    const match = html.match(/<div[^>]*id="blogPostContent"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="blog-tags"[^>]*>/);
    return match ? match[1] : html;
  };

  // Helper to wrap the editable content back into the full HTML structure
  const wrapContent = (editable: string, fullHtml: string) => {
    return fullHtml.replace(/(<div[^>]*id="blogPostContent"[^>]*>)[\s\S]*?(<\/div>\s*<div[^>]*class="blog-tags"[^>]*>)/, `$1${editable}$2`);
  };

  const parseSEO = (html: string) => {
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="([\s\S]*?)"/);
    const keywordsMatch = html.match(/<meta name="keywords" content="(.*?)"/);
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);

    let finalImage = imageMatch ? imageMatch[1] : "";
    if (finalImage.includes('placeholder.png') || finalImage.includes('_preview')) {
      // Don't treat GHL placeholders as a real featured image
      finalImage = "";
    }

    setSeo({
      title: titleMatch ? titleMatch[1] : "",
      description: descMatch ? descMatch[1].trim() : "",
      keywords: keywordsMatch ? keywordsMatch[1] : "",
      image: finalImage
    });
  };

  const updateHTMLWithSEO = (html: string) => {
    let updated = html;

    // Improved attribute-agnostic meta tag updates (with injection if missing)
    const updateMeta = (name: string, content: string, attrName: string = 'name') => {
      const regex = new RegExp(`<meta[^>]*${attrName}="${name}"[^>]*>`, 'gi');
      if (updated.match(regex)) {
        updated = updated.replace(regex, `<meta ${attrName}="${name}" content="${content}" />`);
      } else if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `  <meta ${attrName}="${name}" content="${content}" />\n</head>`);
      }
    };

    updateMeta('title', seo.title);
    updateMeta('og:title', seo.title, 'property');
    updateMeta('description', seo.description);
    updateMeta('og:description', seo.description, 'property');
    updateMeta('keywords', seo.keywords);
    updateMeta('og:keywords', seo.keywords, 'property');
    
      if (seo.image) {
        updateMeta('image', seo.image);
        updateMeta('og:image', seo.image, 'property');
        updateMeta('twitter:image', seo.image);
        
        // 📸 AGGRESSIVE HERO HUNT:
        // 1. Target picture tags within cover containers
        updated = updated.replace(/(<div[^>]*class="[^"]*blog-cover-image-container[^"]*"[^>]*>[\s\S]*?<picture[^>]*>)([\s\S]*?)(<\/picture>)/gi, (match, open, inner, close) => {
          let newInner = inner.replace(/srcset=".*?"/g, `srcset="${seo.image}"`);
          newInner = newInner.replace(/src=".*?"/g, `src="${seo.image}"`);
          return `${open}${newInner}${close}`;
        });

        // 2. Target standalone header images that might not be in a picture tag
        updated = updated.replace(/(<img[^>]*class="[^"]*(?:header-image|blog-content-blog-image)[^"]*"[^>]*src=")([^"]*)("[^>]*>)/gi, (match, open, src, close) => {
          return `${open}${seo.image}${close}`;
        });
        
        // 3. Fallback: Catch any large header-like images if the above fail
        if (!updated.includes(seo.image)) {
           // Only replace if we find something that looks like a main banner
           updated = updated.replace(/(<img[^>]*id="[^"]*header[^"]*"[^>]*src=")([^"]*)("[^>]*>)/gi, `$1${seo.image}$3`);
        }
      }

    updated = updated.replace(/<title>.*?<\/title>/gi, `<title>${seo.title}</title>`);

    updated = updated.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]+)"([^>]*)>/gi, (match, href, rest) => {
      // Improved multi-site link detection:
      // An external link is absolute (starts with http) and NOT to the current siteId or known local domains.
      const isInternal = href.startsWith('/') || 
                        href.startsWith('#') || 
                        href.includes('localhost') || 
                        (siteId && href.includes(siteId.replace(/-/g, ''))); // matches siteId with or without hyphens
      
      if (href.startsWith('http') && !isInternal) {
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
      const res = await fetch(`${fileSrc}?t=${Date.now()}`);
      const text = await res.text();
      setCode(text);
      parseSEO(text);
      setEditorKey(prev => prev + 1);
      setIsEditing(true);
      setGitStatus(null);
    } catch (err) { 
      alert("Failed to load file."); 
    }
    setLoading(false);
  };

  const handleSave = async (contentToSave?: string) => {
    setLoading(true);
    let finalContent = contentToSave || code;
    
    // Convert Quill's class-based alignment to inline styles for universal support
    finalContent = finalContent.replace(/class="ql-align-center"/g, 'style="text-align: center;"');
    finalContent = finalContent.replace(/class="ql-align-right"/g, 'style="text-align: right;"');
    finalContent = finalContent.replace(/class="ql-align-justify"/g, 'style="text-align: justify;"');

    // Prevent word splitting: ensures words wrap properly instead of breaking mid-word
    if (!finalContent.includes('word-break: normal')) {
      finalContent = `<div style="word-break: normal; overflow-wrap: break-word; text-wrap: pretty;">${finalContent}</div>`;
    }

    // Safety: Prevent users from trying to save to their F: drive from the Live Vercel site
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      alert("⚠️ SAVE BLOCKED: You are on the LIVE Vercel site. \n\nTo save changes to your F: drive and sync to GitHub, you MUST use the local dashboard at http://localhost:3000.\n\nChanges made here will not persist locally.");
      setLoading(false);
      return;
    }

    const finalCode = updateHTMLWithSEO(finalContent);

    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, fileName: currentFile, code: finalCode, syncEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setGitStatus({ success: data.gitSuccess, log: data.gitLog, debug: data.debug });
        if (data.gitSuccess) {
          // Success case
        } else {
          // Failure case is handled by the UI banner now
        }
        setIsEditing(false);
      } else {
        alert(`Save failed: ${data.error || "Unknown Error"}. Make sure 'npm run dev' is running.`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message || "Failed to connect to server"}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, fileName: currentFile, code }),
      });
      const data = await res.json();
      setGitStatus({ success: data.gitSuccess, log: data.gitLog });
      if (data.gitSuccess) {
        alert("GitHub Sync Successful!");
        setGitStatus(null);
      } else {
        alert(`Push failed again: ${data.gitLog}`);
      }
    } catch (err) {
      alert("Network error while pushing.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Shortcuts
  const stateRef = { isEditing, isVisual, code, seo };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (stateRef.isEditing) {
          const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;
          if (stateRef.isVisual && quill) {
            const currentVal = wrapContent(quill.root.innerHTML, stateRef.code);
            handleSaveWithCleanup(currentVal);
          } else {
            handleSaveWithCleanup();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isVisual]);

  const cleanGHLTags = (html: string) => {
    return html.replace(/<!--[\s\S]*?-->/g, '').trim();
  };

  const handleSaveWithCleanup = (contentOverride?: string) => {
    // Force a pull from the editor DOM if in visual mode to ensure we have the latest pixels
    let latestContent = contentOverride;
    if (!latestContent && isVisual) {
       const quillEditor = document.querySelector('.quill-light-fix .ql-editor');
       if (quillEditor) {
         latestContent = wrapContent(quillEditor.innerHTML, code);
       }
    }

    const targetContent = latestContent || code;
    const cleaned = cleanGHLTags(targetContent);
    setCode(cleaned); 
    handleSave(cleaned); 
  };

  const toggleMode = (targetVisual: boolean) => {
    if (isVisual !== targetVisual) {
      const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;
      if (isVisual && quill) {
        const currentVal = wrapContent(quill.root.innerHTML, code);
        setCode(currentVal);
      }
      setIsVisual(targetVisual);
    }
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
        alert(`Rescued ${data.count} images!`);
      } else {
        alert("Media rescue failed.");
      }
    } catch (err) {
      alert("Error connecting to Media Rescue API.");
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File, imgElement?: HTMLImageElement) => {
    const customName = prompt("Rename image?", file.name.split('.')[0]);
    const folderChoice = prompt("Folder? (images/img)", "images");
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
        const finalUrl = `${data.url}?t=${Date.now()}`;
        const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;
        if (quill) {
          if (imgElement) {
             imgElement.src = finalUrl;
             // Force Quill to recognize the change to the DOM element it manages
             quill.update('user');
          } else {
            const range = quill.getSelection();
            quill.insertEmbed(range ? range.index : 0, 'image', finalUrl);
          }
          // Sync back to our parent state
          setCode(prev => wrapContent(quill.root.innerHTML, prev));
        } else if (imgElement) {
          imgElement.src = finalUrl;
        }
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
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
          if (data.success) {
            setLibraryImages(data.images);
            setSelectedImgRef(img);
            setShowMediaLibrary(true);
          } else {
            alert("No images found.");
          }
        } catch (err) {
          alert("Error loading library.");
        } finally {
          setLoading(false);
        }
      } else if (action === "3") {
        const width = prompt("Enter width:", img.getAttribute('width') || img.style.width || "");
        if (width) {
          img.setAttribute('width', width);
          img.style.width = `${width}px`;
          img.style.height = 'auto';
        }
      } else if (action === "4") {
        const url = prompt("Enter new image URL:", img.src);
        if (url && quill) {
          const blot = (window as any).Quill ? (window as any).Quill.find(img) : null;
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
      
      const editor = document.querySelector('.ql-editor');
      if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      <header className="p-4 flex flex-col sm:flex-row justify-between items-center bg-slate-900 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div>
          <div>
            <h1 className="text-sm font-black text-slate-200 capitalize tracking-tight">{siteId.replace(/-/g, ' ')}</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-500 font-mono italic">{currentFile}</p>
              <a 
                href={`/view/${siteId}/${currentFile.replace('.html', '')}`} 
                target="_blank" 
                className="text-[10px] text-cyan-500 hover:text-cyan-400 font-bold underline decoration-cyan-500/30"
              >
                View Local
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className={`text-[10px] font-bold tracking-tighter ${syncEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>
              {syncEnabled ? "CLOUD SYNC ON" : "LOCAL ONLY"}
            </span>
            <button 
              onClick={() => setSyncEnabled(!syncEnabled)}
              className={`w-8 h-4 rounded-full relative transition-all ${syncEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${syncEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
          {isEditing && (
            <>
              <div className="flex bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700">
                <button 
                  onClick={() => toggleMode(true)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isVisual ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  VISUAL
                </button>
                <button 
                  onClick={() => toggleMode(false)}
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
          
          {!isEditing && gitStatus && !gitStatus.success && (
            <button 
              onClick={handlePush}
              disabled={loading}
              className="px-3 py-2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2 animate-pulse"
            >
              ⚠️ RETRY PUSH TO GITHUB
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
            {isEditing ? "Cancel Edit" : "Edit HTML"}
          </button>
          
          {isEditing && (
            <button 
              onClick={() => handleSaveWithCleanup()}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-black hover:bg-cyan-400 disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {loading ? "SAVING..." : "SAVE & PUSH"}
            </button>
          )}
        </div>
      </div>
    </header>
    
    {/* Global Status Banner */}
    {(loading || gitStatus) && (
      <div className={`px-6 py-2 flex items-center justify-between text-[10px] font-black tracking-widest uppercase transition-all ${
        loading ? 'bg-cyan-500 text-slate-950 animate-pulse' : 
        gitStatus?.success ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full bg-white ${loading ? 'animate-bounce' : ''}`}></div>
          <span>
            {loading ? "System processing: Saving changes & syncing..." : 
             gitStatus?.success ? (
               <div className="flex flex-col">
                 <span>✨ Changes saved and synced to GitHub successfully!</span>
                 {gitStatus.debug && (
                   <span className="text-[8px] opacity-70 font-mono mt-0.5">
                     Path: {gitStatus.debug.filePath} | CWD: {gitStatus.debug.cwd}
                   </span>
                 )}
               </div>
             ) : (
               <span>⚠️ Saved locally, but GitHub Sync failed: {gitStatus?.log}</span>
             )}
          </span>
        </div>
        {gitStatus && (
          <button onClick={() => setGitStatus(null)} className="hover:opacity-70">DISMISS</button>
        )}
      </div>
    )}

      <div className="flex-1 flex overflow-hidden bg-white relative">
        <div className={`flex-1 relative transition-all duration-300 ${showSEO ? 'mr-80' : ''}`}>
          {isEditing ? (
            isVisual ? (
              <div className="h-full px-4 py-8 max-w-4xl mx-auto shadow-inner bg-slate-300 min-h-screen overflow-hidden">
                <div className="bg-white border border-slate-300 shadow-xl rounded-xl h-full flex flex-col overflow-hidden" onClick={handleClick}>
                  <ReactQuill 
                    key={editorKey}
                    theme="snow"
                    defaultValue={getEditableContent(code)}
                    onChange={(val) => {
                      setCode(prev => wrapContent(val, prev));
                    }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video'],
                        ['clean']
                      ]
                    }}
                    className="quill-light-fix flex-1 flex flex-col overflow-hidden"
                  />
                </div>
                <style jsx global>{`
                  .quill-light-fix { height: 100% !important; display: flex !important; flex-direction: column !important; }
                  .quill-light-fix .ql-toolbar { background-color: #f8fafc !important; border: none !important; border-bottom: 1px solid #e2e8f0 !important; flex-shrink: 0 !important; z-index: 50 !important; box-shadow: 0 2px 4px rgb(0 0 0 / 0.05) !important; }
                  .quill-light-fix .ql-container { border: none !important; flex: 1 1 auto !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; }
                  .quill-light-fix .ql-editor { 
                    color: #1e293b !important; 
                    background-color: #fff !important; 
                    flex: 1 1 auto !important; 
                    overflow-y: auto !important; 
                    font-size: 16px !important; 
                    line-height: 1.6 !important; 
                    padding: 60px !important; 
                    word-break: normal !important;
                    overflow-wrap: break-word !important;
                    text-wrap: pretty !important;
                  }
                  .quill-light-fix .ql-editor img { max-width: 100% !important; height: auto !important; cursor: pointer !important; transition: outline 0.2s ease !important; }
                  .quill-light-fix .ql-editor img:hover { outline: 2px solid #06b6d4 !important; }
                  .quill-light-fix .ql-editor img:active { outline: 4px solid #06b6d4 !important; }
                  .quill-light-fix .ql-editor img[style*="float: right"],
                  .quill-light-fix .ql-editor img[data-wrap="right"] { float: right !important; margin-left: 2rem !important; margin-bottom: 2rem !important; display: block !important; clear: none !important; }
                  .quill-light-fix .ql-editor img[style*="float: left"],
                  .quill-light-fix .ql-editor img[data-wrap="left"] { float: left !important; margin-right: 2rem !important; margin-bottom: 2rem !important; display: block !important; clear: none !important; }
                  .quill-light-fix .ql-editor [style*="color: rgb(255, 255, 255)"],
                  .quill-light-fix .ql-editor [style*="color: #fff"],
                  .quill-light-fix .ql-editor [style*="color: white"] { background-color: #1e293b !important; padding: 2px 4px !important; border-radius: 4px !important; }
                  .quill-light-fix .ql-editor p { clear: none !important; margin-bottom: 1rem !important; }
                  .quill-light-fix .ql-align-center { text-align: center !important; }
                  .quill-light-fix .ql-align-right { text-align: right !important; }
                  .quill-light-fix .ql-align-justify { text-align: justify !important; }
                  .quill-light-fix .ql-editor::after { content: ""; display: table; clear: both; }
                `}</style>
              </div>
            ) : (
              <Editor
                height="100%"
                theme="light"
                defaultLanguage="html"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on", padding: { top: 20 } }}
              />
            )
          ) : (
            <iframe src={fileSrc} className="w-full h-full border-none" title="Live Preview" key={currentFile} />
          )}
        </div>

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
                <input type="text" value={seo.title} onChange={(e) => setSeo({...seo, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Meta Description</label>
                <textarea rows={4} value={seo.description} onChange={(e) => setSeo({...seo, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Keywords</label>
                <input type="text" value={seo.keywords} onChange={(e) => setSeo({...seo, keywords: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Featured Image</label>
                <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group">
                  {seo.image ? (
                    <img src={seo.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] font-bold">NO IMAGE</div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button 
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await fetch(`/api/list-media?siteId=${siteId}`);
                          const data = await res.json();
                          if (data.success) {
                            setLibraryImages(data.images);
                            // Set a special ref indicator to tell library where to save
                            setSelectedImgRef(null); 
                            // We hack the click handler slightly or add a special state
                            // For simplicity, let's just make the library callback smart
                            (window as any).__onImageSelect = (url: string) => setSeo(prev => ({...prev, image: url}));
                            setShowMediaLibrary(true);
                          }
                        } finally { setLoading(false); }
                      }}
                      className="px-3 py-1.5 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-lg hover:bg-cyan-400"
                    >
                      CHOOSE
                    </button>
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Specialized upload that updates SEO state
                            const customName = prompt("Rename image?", file.name.split('.')[0]);
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('siteId', siteId);
                            if (customName) formData.append('customName', customName);
                            formData.append('folder', 'images');
                            setLoading(true);
                            fetch('/api/upload-media', { method: 'POST', body: formData })
                              .then(r => r.json())
                              .then(d => { if (d.success) setSeo(prev => ({...prev, image: d.url})); })
                              .finally(() => setLoading(false));
                          }
                        };
                        input.click();
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg hover:bg-slate-700"
                    >
                      UPLOAD
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                <p className="text-[10px] text-cyan-400/70 leading-relaxed">
                  <strong className="text-cyan-400 block mb-1 uppercase tracking-tighter">SEO Suggestion</strong>
                  {siteId.replace(/-/g, ', ')}, {currentFile.replace('.html', '').replace(/-/g, ', ')}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {showMediaLibrary && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-8">
          <div className="bg-slate-900 border border-slate-800 w-full h-full sm:max-w-6xl sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Library Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Media Assets</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{libraryImages.length} items found for {siteId}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Filter by filename..." 
                  value={librarySearch} 
                  autoFocus
                  onChange={(e) => setLibrarySearch(e.target.value)} 
                  className="flex-1 sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50 shadow-inner" 
                />
                <button 
                  onClick={() => setShowMediaLibrary(false)} 
                  className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 p-2.5 rounded-xl text-slate-400 transition-all border border-slate-700"
                  title="Close Library"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            {/* Library Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
              {libraryImages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="font-black uppercase tracking-widest">Loading assets...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {libraryImages
                    .filter(img => !librarySearch || img.name.toLowerCase().includes(librarySearch.toLowerCase()))
                    .map((imgData, i) => (
                    <div key={i} className="group relative aspect-square bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col shadow-xl">
                      <div className="relative flex-1 bg-slate-800 overflow-hidden">
                        <img 
                          src={`${imgData.url}?t=${Date.now()}`} 
                          alt={imgData.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
                          <button 
                            onClick={() => {
                              const bustUrl = `${imgData.url}?t=${Date.now()}`;
                              if (selectedImgRef) {
                                const quill = (document.querySelector('.quill-light-fix .ql-editor') as any)?.__quill;
                                if (quill) {
                                  selectedImgRef.src = bustUrl;
                                  quill.update('user');
                                  setCode(prev => wrapContent(quill.root.innerHTML, prev));
                                } else {
                                  selectedImgRef.src = bustUrl;
                                }
                              } else if ((window as any).__onImageSelect) {
                                (window as any).__onImageSelect(bustUrl);
                                (window as any).__onImageSelect = null;
                              }
                              setShowMediaLibrary(false);
                            }}
                            className="w-full py-2 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-lg hover:bg-cyan-400 transform translate-y-2 group-hover:translate-y-0 transition-all uppercase tracking-tighter"
                          >
                            Select Image
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 text-[9px] truncate text-slate-500 font-mono text-center">
                        {imgData.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-center sm:text-right">
              <button 
                onClick={() => setShowMediaLibrary(false)}
                className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest px-4 py-2"
              >
                Cancel and return to editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
