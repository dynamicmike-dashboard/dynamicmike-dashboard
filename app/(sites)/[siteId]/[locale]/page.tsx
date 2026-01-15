// 1. Define the props as a Promise
interface PageProps {
  params: Promise<{ siteId: string; locale: string }>;
}

// 2. Make the function 'async' and 'await' the params
export default async function Page({ params }: PageProps) {
  const { siteId, locale } = await params; 

  return (
    <div>
      <h1>Site: {siteId}</h1>
      <p>Language: {locale}</p>
    </div>
  );
}