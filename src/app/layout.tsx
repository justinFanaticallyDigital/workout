import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/ui/Nav";

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Personal Fitness Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ft-bg min-h-screen antialiased">
        <Nav />
        <div className="max-w-[1100px] mx-auto px-6 py-7">
          {children}
        </div>
      </body>
    </html>
  );
}
