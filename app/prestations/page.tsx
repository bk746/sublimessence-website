import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

const page = loadSitePage("prestations");

export const metadata = siteMetadataFromLoaded(page.metadata);

export default function PrestationsPage() {
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
