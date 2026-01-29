"use strict";
"use client";

import { useState, useEffect } from 'react';
import { AgentConfig } from '@/lib/storage';
import { LayoutGrid, Building2, Briefcase, Settings, User, BookOpen } from 'lucide-react';
import DashboardTab from '@/components/realai/DashboardTab';
import PropertiesTab from '@/components/realai/PropertiesTab';
import ConciergeTab from '@/components/realai/ConciergeTab';
import SettingsTab from '@/components/realai/SettingsTab';
import UserManualTab from '@/components/realai/UserManualTab';

export default function RealAiDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // MVP: Hardcode or fetch 'default' agent first, then allow switching via ?agentId query logic if needed
  useEffect(() => {
    // Check URL params for agentId
    const params = new URLSearchParams(window.location.search);
    const agentId = params.get('agentId') || 'default';

    fetch(`/api/widget/config?agentId=${agentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
             console.error("Agent load failed"); 
        } else {
             // We need the FULL config including internal fields that might not be in the public widget API
             // For now, the public API + some defaults will do, strictly we should use a /api/agent/me endpoint
             // But since we built /api/widget/config to return most things, we use it.
             // Wait, widget config hides API Key. SettingsTab needs it.
             // In a real app, we'd have a protected route. For Local-First MVP, we'll just re-fetch locally active config?
             // Actually, the previous step added POST support to config route, but didn't change GET response filtering.
             // We will assume for this "Admin PWA" we can fetch full config if we are "Authorized".
             // Simplified: just use the data we have and add missing fields as empty strings for now.
             setAgent({ ...data, apiKey: data.apiKey || '' }); 
        }
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const handleUpdateAgent = async (updates: Partial<AgentConfig>) => {
    if (!agent) return;
    try {
        const res = await fetch('/api/widget/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: agent.id, updates })
        });
        const data = await res.json();
        if (data.success) {
            setAgent(data.config);
            alert("Settings Saved!"); // Simple feedback
        }
    } catch(e) {
        alert("Failed to save settings");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Agent OS...</div>;
  if (!agent) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">Agent Not Found</div>;

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === id ? 'text-blue-600' : 'text-slate-400'}`}
    >
        <Icon className={`w-6 h-6 ${activeTab === id ? 'fill-current' : ''}`} strokeWidth={activeTab === id ? 2 : 1.5} />
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
        
        {/* Header */}
        <header className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <LayoutGrid size={18} />
                </div>
                <h1 className="font-bold text-slate-900 tracking-tight">Agent OS</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100">
                    <img src={agent.logoUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-lg mx-auto">
            {activeTab === 'dashboard' && <DashboardTab agent={agent} />}
            {activeTab === 'properties' && <PropertiesTab />}
            {activeTab === 'concierge' && <ConciergeTab agent={agent} onUpdate={handleUpdateAgent} />}
            {activeTab === 'manual' && <UserManualTab />}
            {activeTab === 'settings' && <SettingsTab agent={agent} onUpdate={handleUpdateAgent} />}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
            <NavItem id="dashboard" label="Home" icon={HomeIcon} />
            <NavItem id="properties" label="Properties" icon={Building2} />
            
            {/* Concierge Button (Center) */}
            <div className="relative -top-5">
                <button 
                    onClick={() => setActiveTab('concierge')}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform active:scale-95 ${
                        activeTab === 'concierge' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-900 text-white'
                    }`}
                >
                    <User size={24} />
                </button>
            </div>

            <NavItem id="manual" label="Manual" icon={BookOpen} />
            <NavItem id="settings" label="Settings" icon={Settings} />
        </nav>

    </div>
  );
}

// Simple Home Icon wrapper to match layout
const HomeIcon = (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
