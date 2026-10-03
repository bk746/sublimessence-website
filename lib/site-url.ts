export const SITE_URL = "https://atelier-sublimessence.com";

export function isPreviewDeployment(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" ||
    (process.env.VERCEL_URL?.includes("vercel.app") ?? false)
  );
}

export function canonicalPathFromMeta(canonical?: string): string {
  if (!canonical) return "/";
  return (
    canonical
      .replace(SITE_URL, "")
      .replace(/\.html$/, "")
      .replace(/\/index$/, "") || "/"
  );
}
