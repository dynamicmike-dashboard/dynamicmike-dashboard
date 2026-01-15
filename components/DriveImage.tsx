import Image from 'next/image';

export default function DriveImage({ fileId, alt }: { fileId: string; alt: string }) {
  // This uses the Google Drive thumbnail trick to show images in your dashboard
  const src = `https://lh3.googleusercontent.com/u/0/d/${fileId}=w400-h400-p`;

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-800">
      <img
        src={src}
        alt={alt}
        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  );
}