import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("atelier").metadata);
}

export default function AtelierPage() {
  const page = loadSitePage("atelier");
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
