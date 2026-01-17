"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar (Permanent on large screens) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Slide-in Overlay) */}
      <div className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className="relative w-72 h-full">
          <Sidebar onClose={() => setIsMenuOpen(false)} />
        </div>
      </div>
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Mobile Header with Hamburger Trigger */}
        <div className="md:hidden p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-slate-800 rounded-lg text-cyan-400 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">GHL Rescue</span>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {children}
      </main>
    </div>
  );
}