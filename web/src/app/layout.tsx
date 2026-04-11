import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";

import { SiteChrome } from "@/components/site/SiteChrome";
import { getSiteData } from "@/lib/content/store";

import "./globals.css";

const displayFont = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="sv" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
