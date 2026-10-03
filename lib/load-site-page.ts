import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Metadata } from "next";
import {
  SITE_URL,
  canonicalPathFromMeta,
  isPreviewDeployment,
} from "@/lib/site-url";

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

function transformHtml(html: string, key: SitePageKey): string {
  let out = html
    .replace(/\bsrc="img\//g, 'src="/img/')
    .replace(/\bsrcset="img\//g, 'srcset="/img/')
    .replace(/\bhref="index\.html/g, 'href="/')
    .replace(/\bhref="prestations\.html/g, 'href="/prestations')
    .replace(/\bhref="realisations\.html/g, 'href="/realisations')
    .replace(/\bhref="atelier\.html/g, 'href="/atelier')
    .replace(/\bhref="contact\.html/g, 'href="/contact')
    .replace(/<script\s+src="site\.js"\s*><\/script>\s*/gi, "")
    .replace(
      /aria-label="Atelier Sublimessence, accueil"/g,
      'aria-label="Sublimessence – Atelier · Peintre sur mobilier · Annecy, accueil"',
    )
    .replace(/<div class="rvs-grid" role="list">/g, '<div class="rvs-grid">')
    .replace(/<h4>/g, '<h2 class="ft-h">')
    .replace(/<\/h4>/g, "</h2>");

  if (key === "prestations") {
    out = out.replace(
      /<section class="prx prx-page" id="prestations" aria-label="Les trois prestations">\s*<div class="prx-stack">/,
      '<section class="prx prx-page" id="prestations" aria-label="Les trois prestations"><h2 class="sr">Les trois prestations</h2><div class="prx-stack">',
    );
  }

  if (key === "index") {
    out = out
      .replace(
        /<div class="h4-orn" aria-hidden="true"><\/div><div class="h4-lin" aria-hidden="true"><\/div>/,
        '<div class="h4-orn" aria-hidden="true"></div>',
      )
      .replace(
        /src="\/img\/hero-piece\.webp"/,
        'src="/img/hero-piece-1280.webp" srcset="/img/hero-piece-640.webp 640w, /img/hero-piece-960.webp 960w, /img/hero-piece-1280.webp 1280w, /img/hero-piece.webp 1800w" sizes="(max-width: 980px) 92vw, 55vw" fetchpriority="high" loading="eager"',
      )
      .replace(
        /src="\/img\/hero-dessin\.webp"/,
        'src="/img/hero-dessin-1280.webp" srcset="/img/hero-dessin-640.webp 640w, /img/hero-dessin-960.webp 960w, /img/hero-dessin-1280.webp 1280w, /img/hero-dessin.webp 1800w" sizes="(max-width: 980px) 92vw, 55vw" loading="eager"',
      );
  }

  return out;
}

function extractTag(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim();
}

function resolveHtmlPath(key: SitePageKey): string {
  const name = HTML_FILES[key];
  const filePath = path.join(CONTENT_DIR, name);
  if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
    throw new Error(
      `Fichier HTML introuvable pour « ${key} » (${name}) dans ${CONTENT_DIR}`,
    );
  }
  return filePath;
}

export function loadSitePage(key: SitePageKey) {
  const raw = fs.readFileSync(
    /* turbopackIgnore: true */ resolveHtmlPath(key),
    "utf8",
  );

  const bodyClass =
    extractTag(raw, /<body[^>]*\bclass="([^"]*)"/i) ?? "pg-index";
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch ? transformHtml(bodyMatch[1], key) : "";

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
  const canonicalPath = canonicalPathFromMeta(meta.canonical);
  const preview = isPreviewDeployment();

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(SITE_URL),
    robots: preview ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: canonicalPath || "/" },
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
