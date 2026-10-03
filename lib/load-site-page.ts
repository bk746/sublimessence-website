import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Metadata } from "next";

const CONTENT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
);

const HTML_FILES = {
  index: "index.html",
  prestations: "prestations.html",
  realisations: "realisations.html",
  atelier: "atelier.html",
  contact: "contact.html",
} as const;

export type SitePageKey = keyof typeof HTML_FILES;

function transformHtml(html: string): string {
  return html
    .replace(/\bsrc="img\//g, 'src="/img/')
    .replace(/\bsrcset="img\//g, 'srcset="/img/')
    .replace(/\bhref="index\.html/g, 'href="/')
    .replace(/\bhref="prestations\.html/g, 'href="/prestations')
    .replace(/\bhref="realisations\.html/g, 'href="/realisations')
    .replace(/\bhref="atelier\.html/g, 'href="/atelier')
    .replace(/\bhref="contact\.html/g, 'href="/contact')
    .replace(/<script\s+src="site\.js"\s*><\/script>\s*/gi, "");
}

function extractTag(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim();
}

function resolveHtmlPath(key: SitePageKey): string {
  const name = HTML_FILES[key];
  const candidates = [
    path.join(CONTENT_DIR, name),
    path.join(process.cwd(), "content", name),
    path.join(process.cwd(), name),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) return filePath;
  }
  throw new Error(
    `Fichier HTML introuvable pour « ${key} » (${name}). Chemins testés : ${candidates.join(", ")}`,
  );
}

export function loadSitePage(key: SitePageKey) {
  const raw = fs.readFileSync(resolveHtmlPath(key), "utf8");

  const bodyClass =
    extractTag(raw, /<body[^>]*\bclass="([^"]*)"/i) ?? "pg-index";
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch ? transformHtml(bodyMatch[1]) : "";

  const title =
    extractTag(raw, /<title>([\s\S]*?)<\/title>/i) ??
    "Atelier Sublimessence";
  const description = extractTag(
    raw,
    /<meta\s+name="description"\s+content="([^"]*)"/i,
  );
  const canonical = extractTag(
    raw,
    /<link\s+rel="canonical"\s+href="([^"]*)"/i,
  );
  const ogImage = extractTag(
    raw,
    /<meta\s+property="og:image"\s+content="([^"]*)"/i,
  );

  const jsonLdBlocks: string[] = [];
  const ldRe =
    /<script\s+type="application\/ld\+json">\s*([\s\S]*?)<\/script>/gi;
  let ldMatch: RegExpExecArray | null;
  while ((ldMatch = ldRe.exec(raw)) !== null) {
    jsonLdBlocks.push(ldMatch[1].trim());
  }

  return {
    bodyClass,
    bodyHtml,
    metadata: { title, description, canonical, ogImage, jsonLdBlocks },
  };
}

export function siteMetadataFromLoaded(meta: {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}): Metadata {
  const canonicalPath = meta.canonical
    ?.replace("https://atelier-sublimessence.com", "")
    .replace(/\.html$/, "")
    .replace(/\/index$/, "/");

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL("https://atelier-sublimessence.com"),
    alternates: canonicalPath
      ? { canonical: canonicalPath || "/" }
      : undefined,
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: "fr_FR",
      type: "website",
      siteName: "Atelier Sublimessence",
      ...(meta.ogImage ? { images: [{ url: meta.ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    other: {
      "theme-color": "#F3EDE2",
    },
  };
}
