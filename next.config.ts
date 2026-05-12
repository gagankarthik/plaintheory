import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'",
    "https://va.vercel-scripts.com",
    "https://*.vercel-analytics.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://api.dicebear.com",
    "https://*.amazonaws.com",
  ],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "connect-src": [
    "'self'",
    "https://*.amazonaws.com",
    "https://cognito-idp.us-east-2.amazonaws.com",
    "https://api.openai.com",
    "https://va.vercel-scripts.com",
    "https://*.vercel-analytics.com",
    "https://*.vercel-insights.com",
    ...(isProd ? [] : ["ws://localhost:*", "http://localhost:*"]),
  ],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
};

const csp = Object.entries(CSP_DIRECTIVES)
  .map(([k, v]) => `${k} ${v.join(" ")}`)
  .join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "api.dicebear.com" }],
  },
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      {
        source: "/icon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source:
          "/(sign-in|sign-up|forgot-password|reset-password|pricing|terms|privacy|accessibility)",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=3600" }],
      },
    ];
  },
};

export default nextConfig;
