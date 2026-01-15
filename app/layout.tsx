import type { Metadata } from "next";
import "./globals.css"; // We will create this next

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
    <html lang="en">
      <body className="antialiased bg-slate-950">
        {children}
      </body>
    </html>
  );
}