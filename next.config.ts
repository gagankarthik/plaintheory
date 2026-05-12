import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'",
    // Stripe.js
    "https://js.stripe.com",
    // Stripe Radar uses Google reCAPTCHA
    "https://www.google.com",
    "https://www.gstatic.com",
    // Vercel analytics
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
    // Stripe may render card-brand icons
    "https://*.stripe.com",
  ],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "connect-src": [
    "'self'",
    // AWS / Cognito
    "https://*.amazonaws.com",
    "https://cognito-idp.us-east-2.amazonaws.com",
    // OpenAI
    "https://api.openai.com",
    // Stripe APIs and telemetry
    "https://api.stripe.com",
    "https://q.stripe.com",
    "https://r.stripe.com",
    "https://m.stripe.com",
    // Vercel analytics
    "https://va.vercel-scripts.com",
    "https://*.vercel-analytics.com",
    "https://*.vercel-insights.com",
    ...(isProd ? [] : ["ws://localhost:*", "http://localhost:*"]),
  ],
  // Stripe embeds its payment UI in iframes from js.stripe.com.
  // reCAPTCHA also uses an iframe from google.com.
  "frame-src": [
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://www.google.com",
  ],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  // Stripe Checkout is hosted on stripe.com; allow form submissions there too.
  "form-action": ["'self'", "https://checkout.stripe.com"],
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
