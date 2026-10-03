"use client";

import Script from "next/script";
import { useEffect } from "react";

type SitePageProps = {
  bodyClass: string;
  bodyHtml: string;
  jsonLdBlocks: string[];
};

export function SitePage({ bodyClass, bodyHtml, jsonLdBlocks }: SitePageProps) {
  useEffect(() => {
    document.body.className = bodyClass;
    return () => {
      document.body.className = "";
      document.body.removeAttribute("class");
    };
  }, [bodyClass]);

  return (
    <>
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/site.js" strategy="afterInteractive" />
    </>
  );
}
