// 1. Define the props as a Promise
interface PageProps {
  params: Promise<{ siteId: string }>;
}

// 2. Make the function 'async' and 'await' the params
export default async function AdminDashboardPage({ params }: PageProps) {
  const { siteId } = await params; // This line fixes the build error

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Managing: {siteId}</h1>
      {/* ... the rest of your dashboard code ... */}
    </div>
  );
}