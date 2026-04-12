import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteChrome } from "@/components/site/SiteChrome";
import { getSiteData } from "@/lib/content/store";

import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteData();

  return {
    metadataBase: new URL("https://expertbyran.ai"),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    openGraph: {
      title: site.name,
      description: site.description,
      siteName: site.name,
      type: "website",
      locale: "sv_SE",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={bodyFont.variable}>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
