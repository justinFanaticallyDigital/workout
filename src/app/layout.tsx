import type { Metadata, Viewport } from "next";
import { Audiowide, Jost, Oxanium } from "next/font/google";
import "./globals.css";
import { BottomNav, MainFrame } from "@/components/kit";
import { ToastProvider } from "@/components/ui/Toast";
import SessionProvider from "@/components/SessionProvider";
import OfflineSyncProvider from "@/components/OfflineSyncProvider";

const audiowide = Audiowide({ weight: "400", subsets: ["latin"], variable: "--font-audiowide", display: "swap" });
const oxanium = Oxanium({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-oxanium", display: "swap" });
const jost = Jost({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Personal training and nutrition tracking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
  themeColor: "#DCE6E0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${audiowide.variable} ${oxanium.variable} ${jost.variable}`}>
      <head>
        {/* Standard PWA hint — Next's metadata.appleWebApp only emits the apple-specific tag. */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-ft-bg font-body text-ft-white antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-ft-md focus:bg-ft-accent focus:px-4 focus:py-2 focus:font-data focus:text-sm focus:font-bold focus:text-ft-on-accent"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <OfflineSyncProvider>
            <ToastProvider>
              <MainFrame>{children}</MainFrame>
              <BottomNav />
            </ToastProvider>
          </OfflineSyncProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
