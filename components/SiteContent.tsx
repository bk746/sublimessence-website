import { BodyClass } from "@/components/BodyClass";
import { SiteScripts } from "@/components/SiteScripts";
import type { SitePageKey } from "@/lib/load-site-page";

type SiteContentProps = {
  page: SitePageKey;
  bodyClass: string;
  bodyHtml: string;
  jsonLdBlocks: string[];
};

export function SiteContent({
  page,
  bodyClass,
  bodyHtml,
  jsonLdBlocks,
}: SiteContentProps) {
  return (
    <>
      <BodyClass className={bodyClass} />
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <SiteScripts page={page} />
    </>
  );
}
