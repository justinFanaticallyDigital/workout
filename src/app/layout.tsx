import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/ui/Nav";
import { ToastProvider } from "@/components/ui/Toast";
import SessionProvider from "@/components/SessionProvider";
import OfflineSyncProvider from "@/components/OfflineSyncProvider";

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Personal Fitness Tracking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrack",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1a1a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ft-bg min-h-screen antialiased">
        <SessionProvider>
          <OfflineSyncProvider>
            <ToastProvider>
              <Nav />
              <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 sm:py-7 pb-safe">
                {children}
              </div>
            </ToastProvider>
          </OfflineSyncProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
