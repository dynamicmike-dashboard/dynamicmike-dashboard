export const dynamic = 'force-static';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function PublicSitePage(props: { params: Params }) {
  const { siteId, slug } = await props.params;

  // Map the URL to the static file in /public/content
  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const iframeSrc = `/content/${siteId}/${fileName}`;

  return (
    <main className="fixed inset-0 w-full h-full bg-white">
      {/* The Public sees ONLY the content. 
         No dashboard, no sidebars, just the rescued site at full screen. 
      */}
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-none" 
        title="Rescued Site"
      />
    </main>
  );
}