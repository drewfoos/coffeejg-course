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
};

export default nextConfig;
