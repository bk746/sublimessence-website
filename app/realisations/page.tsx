import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

const page = loadSitePage("realisations");

export const metadata = siteMetadataFromLoaded(page.metadata);

export default function RealisationsPage() {
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
