import { getSiteMedia } from '@/lib/drive';
import DriveImage from '@/components/DriveImage'; // The component we discussed earlier

export default async function MediaPage({ params }) {
  const { siteId } = params;
  
  // In a real app, you'd map siteId to a specific Folder ID in a config file
  const media = await getSiteMedia(process.env.DRIVE_FOLDER_ID!);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white uppercase tracking-widest">
        Media: {siteId.replace('-', ' ')}
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {media.map((file) => (
          <div key={file.id} className="group relative">
            <DriveImage fileId={file.id} alt={file.name} />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-cyan-400 font-mono">{file.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}