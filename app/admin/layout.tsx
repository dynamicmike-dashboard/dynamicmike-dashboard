import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"; // This stays the same

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950">
        {/* The persistent WP-style sidebar */}
        <AdminSidebar />
        
        <main className="flex-1 overflow-y-auto p-8 text-slate-200">
          <div className="flex items-center justify-between mb-8">
            <SidebarTrigger />
            {/* Breadcrumbs or Site Name could go here */}
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}