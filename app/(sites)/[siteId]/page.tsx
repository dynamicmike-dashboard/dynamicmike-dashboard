// 1. Define params as a Promise
interface PageProps {
  params: Promise<{ siteId: string }>;
}

// 2. Change the function to 'async' and 'await' the params
export default async function Page({ params }: PageProps) {
  const { siteId } = await params; // MUST await the params in Next.js 15

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Rescued Site: {siteId}</h1>
      <p className="mt-4 text-slate-400">This content is being served from /content/{siteId}</p>
    </div>
  );
}