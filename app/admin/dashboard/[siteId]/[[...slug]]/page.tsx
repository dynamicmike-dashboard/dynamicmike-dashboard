// Import the new sidebar
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboardPage(props: { params: Params }) {
  // ... existing state and logic ...

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* NEW SIDEBAR COMPONENT */}
      <AdminSidebar />

      {/* MAIN CONTENT AREA (Existing Dashboard) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-4 ...">
           {/* ... existing header code ... */}
        </header>

        <div className="flex-1 bg-white relative">
           {/* ... existing Editor/Iframe code ... */}
        </div>
      </div>
    </div>
  );
}