import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

type Params = Promise<{ siteId: string; slug?: string[] }>;

export default async function DynamicRescuedPage(props: { params: Params }) {
  const { siteId, slug } = await props.params;

  const fileName = (slug && slug.length > 0) ? `${slug.join('/')}.html` : 'index.html';
  const filePath = path.join(process.cwd(), 'content', siteId, fileName);

  // Check if file exists WITHOUT a promise to prevent hanging
  if (!fs.existsSync(filePath)) {
    return (
      <div className="p-20 text-white">
        <h1 className="text-xl">File Not Found</h1>
        <p className="text-slate-500">Path: content/{siteId}/{fileName}</p>
      </div>
    );
  }

  try {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="bg-white p-6 rounded shadow-2xl text-black min-h-screen">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    );
  } catch (err) {
    return <div className="text-white p-20">Error reading content.</div>;
  }
}