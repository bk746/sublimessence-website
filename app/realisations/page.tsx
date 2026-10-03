import { SiteContent } from "@/components/SiteContent";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export const dynamic = "force-static";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("realisations").metadata);
}

export default function RealisationsPage() {
  const page = loadSitePage("realisations");
  return (
    <SiteContent
      page="realisations"
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
