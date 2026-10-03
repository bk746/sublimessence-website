import { SitePage } from "@/components/SitePage";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("contact").metadata);
}

export default function ContactPage() {
  const page = loadSitePage("contact");
  return (
    <SitePage
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
