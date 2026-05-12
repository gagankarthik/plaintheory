import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://plaintheory.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/terms", "/privacy"],
        disallow: ["/api/", "/app/", "/onboarding", "/dev/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
