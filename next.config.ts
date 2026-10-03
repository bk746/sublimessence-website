import type { NextConfig } from "next";

const assetVersion = process.env.NEXT_PUBLIC_SITE_ASSET_VERSION ?? "1";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600],
    imageSizes: [160, 320, 480],
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      {
        source: "/prestations.html",
        destination: "/prestations",
        permanent: true,
      },
      {
        source: "/realisations.html",
        destination: "/realisations",
        permanent: true,
      },
      { source: "/atelier.html", destination: "/atelier", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    const immutable = "public, max-age=31536000, immutable";
    return [
      {
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: immutable }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: immutable }],
      },
      {
        source: "/site.css",
        headers: [{ key: "Cache-Control", value: immutable }],
      },
      {
        source: "/site.js",
        headers: [{ key: "Cache-Control", value: immutable }],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SITE_ASSET_VERSION: assetVersion,
  },
};

export default nextConfig;
