"use client";

import Script from "next/script";
import type { SitePageKey } from "@/lib/load-site-page";

const ASSET_VERSION = process.env.NEXT_PUBLIC_SITE_ASSET_VERSION ?? "1";

type SiteScriptsProps = {
  page: SitePageKey;
};

export function SiteScripts({ page: _page }: SiteScriptsProps) {
  const v = ASSET_VERSION;
  return <Script src={`/site.js?v=${v}`} strategy="afterInteractive" />;
}
