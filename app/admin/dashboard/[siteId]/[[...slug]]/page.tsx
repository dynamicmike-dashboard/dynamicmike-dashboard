type Params = Promise<{ siteId: string }>;

export default async function TestPage(props: { params: Params }) {
  const { siteId } = await props.params;
  return (
    <div className="p-20 text-white bg-slate-900">
      <h1 className="text-2xl font-bold italic">Checking Content for: {siteId}</h1>
      <p className="mt-4 text-slate-400">Static test successful. File system reading is currently disabled to prevent timeouts.</p>
    </div>
  );
}