import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
