import * as React from "react"
import { cn } from "@/lib/utils"

export const Sidebar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <aside className={cn("flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800", className)}>
    {children}
  </aside>
)

export const SidebarContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-auto p-4">{children}</div>
)

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full overflow-hidden">{children}</div>
)