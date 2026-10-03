import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const assetVersion = process.env.NEXT_PUBLIC_SITE_ASSET_VERSION ?? "1";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href={`/site.css?v=${assetVersion}`}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
