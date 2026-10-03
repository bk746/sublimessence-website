import { SiteContent } from "@/components/SiteContent";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export const dynamic = "force-static";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("prestations").metadata);
}

export default function PrestationsPage() {
  const page = loadSitePage("prestations");
  return (
    <SiteContent
      page="prestations"
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
