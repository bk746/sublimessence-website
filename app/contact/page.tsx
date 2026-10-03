import { SiteContent } from "@/components/SiteContent";
import { loadSitePage, siteMetadataFromLoaded } from "@/lib/load-site-page";

export const dynamic = "force-static";

export function generateMetadata() {
  return siteMetadataFromLoaded(loadSitePage("contact").metadata);
}

export default function ContactPage() {
  const page = loadSitePage("contact");
  return (
    <SiteContent
      page="contact"
      bodyClass={page.bodyClass}
      bodyHtml={page.bodyHtml}
      jsonLdBlocks={page.metadata.jsonLdBlocks}
    />
  );
}
