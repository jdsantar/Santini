import type { NextConfig } from "next";

function buildContentSecurityPolicy() {
  const scriptSrc = process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    : "script-src 'self';";

  return [
    "default-src 'self';",
    scriptSrc,
    "script-src-attr 'none';",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    "img-src 'self' data: blob: https:;",
    "font-src 'self' https://fonts.gstatic.com;",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
    "worker-src 'self' blob:;",
    "manifest-src 'self';",
    "object-src 'none';",
    "media-src 'self';",
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self';",
  ].join(" ");
}

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
