import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("prestations").metadata);
}

export default function PrestationsPage() {
  const page = loadSitePage("prestations");
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
