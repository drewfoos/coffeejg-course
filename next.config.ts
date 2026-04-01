import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "storage.ko-fi.com" },
      { hostname: "booth.pximg.net" },
      { hostname: "storage.vgen.co" },
      { hostname: "i.imgur.com" },
      { hostname: "pbs.twimg.com" },
      { hostname: "storage.googleapis.com" },
      { hostname: "public-files.gumroad.com" },
      { hostname: "placehold.co" },
    ],
  },

  // Remove X-Powered-By header (leaks Next.js version)
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Strict transport security (HTTPS only, 1 year)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // XSS protection (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
