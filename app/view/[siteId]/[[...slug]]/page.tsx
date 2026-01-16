export const dynamic = 'force-static';
type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function PublicViewer(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    /* 'fixed inset-0' pins the container to all 4 corners of the screen.
       'h-screen' ensures it is exactly 100% of the viewport height.
    */
    <main className="fixed inset-0 w-full h-screen bg-white">
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-none" 
        title="Rescued Site Viewer" 
        style={{ display: 'block' }} // Prevents tiny gaps at the bottom
      />
    </main>
  );
}