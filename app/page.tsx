import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

const page = loadSitePage("index");

export const metadata = siteMetadataFromLoaded(page.metadata);

export default function Home() {
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
