import { Suspense } from "react";

// In Next.js 15, params MUST be a Promise
type Params = Promise<{ siteId: string }>;

interface PageProps {
  params: Params;
}

export default async function AdminDashboardPage(props: { params: Params }) {
  // You MUST await the params before destructuring
  const { siteId } = await props.params;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Dashboard: <span className="text-cyan-400">{siteId}</span>
        </h2>
      </div>
      
      <Suspense fallback={<div className="text-white">Loading stats...</div>}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Dashboard content goes here */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-medium text-slate-400">Status</p>
            <p className="text-2xl font-bold text-green-400">Live & Rescued</p>
          </div>
        </div>
      </Suspense>
    </div>
  );
}