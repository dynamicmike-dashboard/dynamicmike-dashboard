import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "GHL Rescue Dashboard",
  description: "Aura Multi-Site Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 min-h-screen text-slate-50">
        {children}
      </body>
    </html>
  );
}