import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/ui/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import SessionProvider from "@/components/SessionProvider";
import OfflineSyncProvider from "@/components/OfflineSyncProvider";
import ThemeInit from "@/components/ThemeInit";

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
  themeColor: "#2a2d2f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ft-bg min-h-screen antialiased">
        <ThemeInit />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ft-accent focus:text-ft-bg focus:px-4 focus:py-2 focus:rounded focus:font-body focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <OfflineSyncProvider>
            <ToastProvider>
              <main id="main-content" className="max-w-[600px] mx-auto px-4 py-4 pb-24">
                {children}
              </main>
              <BottomNav />
            </ToastProvider>
          </OfflineSyncProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
