// 1. THIS IS THE MOST IMPORTANT LINE - it breaks the "spinning" loop
export const dynamic = 'force-dynamic'; 

import { notFound } from 'next/navigation';

// Next.js 15 requires Params to be a Promise
type Params = Promise<{ siteId: string }>;

export default async function AdminDashboardPage(props: { params: Params }) {
  // 2. You MUST await the params in Next.js 15
  const { siteId } = await props.params;

  return (
    <div className="p-20 text-white bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold italic border-b border-slate-700 pb-4">
        Dashboard: <span className="text-cyan-400">{siteId}</span>
      </h1>
      <div className="mt-10 p-6 bg-slate-950 rounded-xl border border-slate-800">
        <p className="text-slate-400">
          Engine test successful. The dynamic route is now responding.
        </p>
      </div>
    </div>
  );
}