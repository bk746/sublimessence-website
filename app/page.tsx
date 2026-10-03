import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export default function Home() {
  const page = loadSitePage("index");
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("index").metadata);
}
