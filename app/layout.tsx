// Change "globals" to "global" if that is what your file is named
import "./global.css"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}