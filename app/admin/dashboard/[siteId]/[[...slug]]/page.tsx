export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function DynamicRescuedPage(props: { params: Params }) {
  // We use await here because Next.js 15 params are asynchronous
  const { siteId } = await props.params;

  return (
    <div className="p-20 text-white bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold italic underline decoration-cyan-500">
        Engine Test: {siteId}
      </h1>
      <p className="mt-4 text-slate-400">
        If you see this immediately, the dynamic route conflict is resolved.
      </p>
    </div>
  );
}