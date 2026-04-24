import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Resource platform CDNs
      { hostname: "storage.ko-fi.com" },
      { hostname: "booth.pximg.net" },
      { hostname: "asset.booth.pm" },
      { hostname: "storage.vgen.co" },
      { hostname: "public-files.gumroad.com" },
      { hostname: "assets.gumroad.com" },
      { hostname: "img.itch.zone" },
      { hostname: "static.itch.io" },
      { hostname: "pbs.twimg.com" },
      { hostname: "video.twimg.com" },
      // General-purpose hosts creators use
      { hostname: "i.imgur.com" },
      { hostname: "cdn.discordapp.com" },
      { hostname: "media.discordapp.net" },
      { hostname: "raw.githubusercontent.com" },
      { hostname: "user-images.githubusercontent.com" },
      { hostname: "avatars.githubusercontent.com" },
      // Admin-curated (not in user suggestion allowlist)
      { hostname: "storage.googleapis.com" },
      { hostname: "placehold.co" },
      { hostname: "static.wixstatic.com" },
      { hostname: "cdn.picrew.me" },
      { hostname: "vroid.com" },
      { hostname: "vtubergraphics.com" },
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
