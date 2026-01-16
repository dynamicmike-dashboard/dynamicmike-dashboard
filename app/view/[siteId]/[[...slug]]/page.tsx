export const dynamic = 'force-static';
type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function PublicViewer(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    // 'fixed inset-0' ensures it covers the entire screen from corner to corner
    <main className="fixed inset-0 w-full h-full bg-white overflow-hidden">
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-none" 
        style={{ height: '100vh' }}
        title="Rescued Site Viewer" 
      />
    </main>
  );
}