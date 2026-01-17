import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar: Hidden on mobile, shown on md screens and up */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}