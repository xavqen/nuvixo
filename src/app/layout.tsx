import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://studiya.com"),
  title: {
    default: "Studiya – Premium NCERT Notes for Class 6 to 12",
    template: "%s | Studiya",
  },
  description:
    "Premium NCERT notes for Class 6–12. Well-structured, exam-ready study material for Science, Maths, English, and more. Download PDF notes, read online.",
  keywords: ["NCERT notes", "class 6 science notes", "CBSE notes", "study material", "studiya"],
  authors: [{ name: "Studiya Team" }],
  creator: "Studiya",
  publisher: "Studiya",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Studiya",
    title: "Studiya – Premium NCERT Notes",
    description: "Study smarter with premium NCERT notes for Class 6–12.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Studiya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studiya – Premium NCERT Notes",
    description: "Study smarter with premium NCERT notes for Class 6–12.",
    images: ["/og-image.png"],
    creator: "@studiya",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  verification: {
    google: "t6vNWWPIElU-JxUI1qO1MUARshpmRQGlZrRC2oVNFqU",
  },

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              },
            }}
          />
        </Providers>
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_ID} />
        )}
      </body>
    </html>
  );
}
