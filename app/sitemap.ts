import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const routes = ["", "/prestations", "/realisations", "/atelier", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
