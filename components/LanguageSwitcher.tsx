'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname(); // e.g., "/en/about"

  const toggleLanguage = (newLocale: string) => {
    // Replace the first segment of the path (the locale)
    const segments = pathname.split('/');
    segments[1] = newLocale; 
    router.push(segments.join('/'));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <button 
        onClick={() => toggleLanguage('en')}
        className="px-3 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-400 transition-colors"
      >
        EN
      </button>
      <button 
        onClick={() => toggleLanguage('es')}
        className="px-3 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-400 transition-colors"
      >
        ES
      </button>
    </div>
  );
}