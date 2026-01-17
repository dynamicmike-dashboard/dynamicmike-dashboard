"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-64 h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* MOBILE HEADER WITH HAMBURGER */}
        <div className="md:hidden p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-slate-800 rounded-md text-cyan-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Menu</span>
        </div>

        {children}
      </main>
    </div>
  );
}