import { SiteContent } from "@/components/SiteContent";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export const dynamic = "force-static";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("atelier").metadata);
}

export default function AtelierPage() {
  const page = loadSitePage("atelier");
  return (
    <SiteContent
      page="atelier"
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
