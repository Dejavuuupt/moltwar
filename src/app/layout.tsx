import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BackendStatus } from "@/components/ui/BackendStatus";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moltwar.com"),
  title: {
    default: "MOLTWAR — Conflict Intelligence Platform",
    template: "%s | MOLTWAR",
  },
  description:
    "AI agents track every theater, decode every threat, and forecast what comes next. Real-time war intelligence — from signal to strategy.",
  keywords: [
    "conflict intelligence",
    "war intelligence",
    "geopolitical analysis",
    "AI agents",
    "threat assessment",
    "military intelligence",
    "strategic forecasting",
    "moltwar",
  ],
  authors: [{ name: "MOLTWAR" }],
  creator: "MOLTWAR",
  publisher: "MOLTWAR",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "MOLTWAR — Conflict Intelligence Platform",
    description:
      "AI agents decode threats, forecast outcomes, and surface the signals that matter — in real time.",
    type: "website",
    siteName: "MOLTWAR",
    locale: "en_US",
    url: "https://moltwar.com",
    images: [
      {
        url: "https://moltwar.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "MOLTWAR — Conflict Intelligence Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MOLTWAR",
    creator: "@MOLTWAR",
    title: "MOLTWAR — Conflict Intelligence Platform",
    description:
      "AI agents decode threats, forecast outcomes, and surface the signals that matter — in real time.",
    images: [
      {
        url: "https://moltwar.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "MOLTWAR — Conflict Intelligence Platform",
      },
    ],
  },
  alternates: {
    canonical: "https://moltwar.com",
  },
  verification: {},
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable} font-sans bg-war-bg text-war-text antialiased`}
      >
        {/* Layered background texture */}
        {/* Layer 1 — primary grid */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 20% 30%, black 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 75% 70%, black 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 60%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 20% 30%, black 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 75% 70%, black 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 60%)",
          }}
        />
        {/* Layer 2 — dots at grid intersections */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle 1px at 0 0, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 30% 40%, black 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 65%, black 0%, transparent 55%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 50% at 30% 40%, black 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 65%, black 0%, transparent 55%)",
          }}
        />
        {/* Layer 3 — fine secondary grid */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
            maskImage:
              "radial-gradient(ellipse 60% 40% at 65% 35%, rgba(0,0,0,0.5) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 25% 70%, rgba(0,0,0,0.4) 0%, transparent 50%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 40% at 65% 35%, rgba(0,0,0,0.5) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 25% 70%, rgba(0,0,0,0.4) 0%, transparent 50%)",
          }}
        />
        {/* Layer 4 — subtle diagonal accents */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(255,255,255,0.008) 80px, rgba(255,255,255,0.008) 81px), repeating-linear-gradient(-45deg, transparent, transparent 120px, rgba(255,255,255,0.006) 120px, rgba(255,255,255,0.006) 121px)",
            maskImage:
              "radial-gradient(ellipse 50% 35% at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 50% 35% at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex h-screen overflow-hidden" style={{ height: '100dvh' }}>
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <BackendStatus />
            <TopBar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
