import { SiteContent } from "@/components/SiteContent";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";
import type { Metadata } from "next";

export const dynamic = "force-static";

const HERO_SRCSET =
  "/img/hero-piece-640.webp 640w, /img/hero-piece-960.webp 960w, /img/hero-piece-1280.webp 1280w, /img/hero-piece.webp 1800w";
const HERO_SIZES = "(max-width: 980px) 92vw, 55vw";

export function generateMetadata(): Metadata {
  const base = siteMetadataFromLoaded(loadSitePage("index").metadata);
  return {
    ...base,
    other: {
      ...(typeof base.other === "object" && base.other ? base.other : {}),
    },
  };
}

export default function Home() {
  const page = loadSitePage("index");
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/img/hero-piece-1280.webp"
        imageSrcSet={HERO_SRCSET}
        imageSizes={HERO_SIZES}
        fetchPriority="high"
      />
      <SiteContent
        page="index"
        bodyClass={page.bodyClass}
        bodyHtml={page.bodyHtml}
        jsonLdBlocks={page.metadata.jsonLdBlocks}
      />
    </>
  );
}
