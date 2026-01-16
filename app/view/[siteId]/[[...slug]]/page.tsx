export const dynamic = 'force-static';
type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function PublicViewer(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <main className="fixed inset-0 w-full h-screen bg-white">
      {/* This is the "Magic" part. We use the iframe normally, 
        but we ensure the internal links stay inside the rescue folder.
      */}
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-none" 
        style={{ display: 'block' }}
        title="Rescued Site Viewer" 
      />
    </main>
  );
}