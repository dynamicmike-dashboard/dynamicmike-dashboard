import { LayoutDashboard, Globe, Image, Settings, Plus } from "lucide-react"
import { sites } from "@/lib/sites" // Your Site Config file

export function AdminSidebar() {
  return (
    <div className="w-64 border-r border-slate-800 flex flex-col h-full bg-slate-900">
      <div className="p-6 font-bold text-cyan-400 tracking-tighter text-xl">
        GHL RESCUE
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {/* Site Switcher Section */}
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          Your Sites
        </div>
        {sites.map(site => (
          <a 
            key={site.domain}
            href={`/admin/${site.subdomain}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-all"
          >
            <Globe size={18} />
            <span className="truncate">{site.name}</span>
          </a>
        ))}

        <hr className="border-slate-800 my-4" />

        {/* Global Tools Section */}
        <div className="space-y-1">
          <a href="/admin/media" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white">
            <Image size={18} /> <span>Media Library</span>
          </a>
          <a href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white">
            <Settings size={18} /> <span>Global Settings</span>
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-cyan-600 text-white font-medium hover:bg-cyan-500">
          <Plus size={18} /> New Rescue
        </button>
      </div>
    </div>
  )
}