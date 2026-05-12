import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AmplifyProvider } from "@/lib/auth/amplify-provider";
import { fontSans, fontSerif } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://plaintheory.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PlainTheory — A calm daily coaching companion",
    template: "%s · PlainTheory",
  },
  description:
    "A daily-life coaching companion. Wake up to a gentle plan, chat with a coach who knows you, and see what's working in a quiet weekly review. Not medical advice.",
  keywords: [
    "daily planner",
    "life coaching app",
    "habit tracker",
    "mood tracker",
    "wellness app",
    "AI coach",
    "morning routine",
    "personal growth",
    "calm app",
  ],
  authors: [{ name: "PlainTheory" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PlainTheory",
    title: "PlainTheory — A calm daily coaching companion",
    description:
      "Gentle morning plans, a coach that knows you, and a quiet weekly review of what's working.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlainTheory — A calm daily coaching companion",
    description:
      "Gentle morning plans, a coach that knows you, and a quiet weekly review of what's working.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
  category: "lifestyle",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1717" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PlainTheory",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "A daily-life coaching companion: morning plans, a coach that knows you, and a quiet weekly review.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1",
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontSerif.variable)}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AmplifyProvider>
            <div className="relative isolate flex min-h-dvh flex-col">{children}</div>
            <Toaster />
          </AmplifyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
