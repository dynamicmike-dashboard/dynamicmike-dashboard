import DriveImage from '@/components/DriveImage';

// 1. Define the interface for the URL parameters
interface PageProps {
  params: Promise<{ siteId: string }>;
}

// 2. Add the PageProps type and make the function async
export default async function MediaPage({ params }: PageProps) {
  
  // 3. You MUST await the params in Next.js 15
  const { siteId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Media for {siteId}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* We will add the logic to map your Drive images here next */}
        <p className="text-slate-400">Loading rescued assets...</p>
      </div>
    </div>
  );
}