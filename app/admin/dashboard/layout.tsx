"use client";

import { useState } from 'react';
import Link from 'next/link'; // <--- ADD THIS LINE
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity ${isMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)} />
        <div className={`relative w-72 h-full transition-transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar onClose={() => setIsMenuOpen(false)} />
        </div>
      </div>
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-slate-800 rounded-lg text-cyan-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest italic">GHL Rescue</span>
          <Link href="/" className="text-cyan-400">🏠</Link>
        </div>

        {children}
      </main>
    </div>
  );
}