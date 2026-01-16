export const dynamic = 'force-static';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function PublicViewer(props: { params: Params }) {
  const { siteId, slug } = await props.params;
  
  // Logic: /breath-of-life -> index.html | /breath-of-life/about -> about.html
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <main className="fixed inset-0 w-full h-full bg-white">
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-none" 
        title="Rescued Site" 
      />
    </main>
  );
}