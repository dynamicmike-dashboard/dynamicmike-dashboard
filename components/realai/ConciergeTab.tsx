"use strict";
import { useState } from 'react';
import { AgentConfig } from '@/lib/storage';
import { Code, Shield, ShieldAlert, Play } from 'lucide-react';

interface ConciergeTabProps {
  agent: AgentConfig;
  onUpdate: (updates: Partial<AgentConfig>) => void;
}

export default function ConciergeTab({ agent, onUpdate }: ConciergeTabProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" 
  data-agent-id="${agent.id}" 
  data-theme="${agent.themeColor}" 
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleGuard = async () => {
    onUpdate({ securityEnabled: !agent.securityEnabled });
  };

  const launchPreview = () => {
    // Dynamically inject script for preview
    const script = document.createElement('script');
    script.src = '/widget.js';
    script.setAttribute('data-agent-id', agent.id);
    script.setAttribute('data-theme', agent.themeColor);
    script.async = true;
    document.body.appendChild(script);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-blue-600" />
          Embed Your Concierge
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Copy this snippet and paste it into the <code>&lt;body&gt;</code> of your website (WordPress, Wix, GHL, etc).
        </p>
        
        <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-x-auto">
          <pre>{embedCode}</pre>
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Security Toggle */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              {agent.securityEnabled ? <Shield className="w-5 h-5 text-green-500" /> : <ShieldAlert className="w-5 h-5 text-red-500" />}
              Estate Guard
            </h3>
            <p className="text-slate-500 text-sm">
              {agent.securityEnabled 
                ? "Active: Leads must provide contact details after 2 generic questions."
                : "Inactive: Chatbot will answer all questions freely."}
            </p>
          </div>
          <button 
            onClick={toggleGuard}
            className={`mt-6 w-full py-2 rounded-lg font-bold text-sm transition-colors ${
              agent.securityEnabled 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {agent.securityEnabled ? 'Disable Security' : 'Enable Security'}
          </button>
        </div>

        {/* Live Preview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-amber-500" />
            Live Preview
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Test your bot's behavior right here before deploying. 
          </p>
          <button 
            onClick={launchPreview}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Launch Test Widget
          </button>
        </div>
      </div>
    </div>
  );
}
