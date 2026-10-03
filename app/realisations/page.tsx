import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("realisations").metadata);
}

export default function RealisationsPage() {
  const page = loadSitePage("realisations");
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
