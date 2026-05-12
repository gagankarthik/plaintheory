import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { CookieConsent } from "@/components/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AmplifyProvider } from "@/lib/auth/amplify-provider";
import { fontSans, fontSerif } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theplaintheory.in";

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
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "PlainTheory",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      description:
        "A daily-life coaching companion: morning plans, a coach that knows you, and a quiet weekly review.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PlainTheory",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this therapy or medical advice?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. PlainTheory is general life coaching — daily routines, food, focus, sleep, mood patterns. For anything clinical, talk to a qualified professional.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use PlainTheory for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Free covers a daily plan, eight check-in types, water and weight tracking, and five chat messages a day. Plus and Premium unlock more.",
          },
        },
        {
          "@type": "Question",
          name: "Does the AI remember me between sessions?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Your focus areas, goals, body metrics, routine, and dietary notes shape every plan and chat reply. Update them in Settings anytime.",
          },
        },
        {
          "@type": "Question",
          name: "Where does my data live?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Encrypted in DynamoDB in us-east-2 with customer-managed KMS keys. Export to JSON or delete your account anytime from Settings.",
          },
        },
      ],
    },
  ];

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
            <CookieConsent />
          </AmplifyProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
