import * as React from "react"
import { cn } from "@/lib/utils"

// 1. Add the SidebarProvider export
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full overflow-hidden bg-slate-950">
    {children}
  </div>
)

// 2. Ensure SidebarTrigger is also exported (we added this earlier)
export const SidebarTrigger = () => (
  <button className="p-2 hover:bg-slate-800 rounded-md text-slate-400">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
  </button>
)

// ... keep your existing Sidebar and SidebarContent code below ...