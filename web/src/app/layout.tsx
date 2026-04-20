import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";

import { SiteChrome } from "@/components/site/SiteChrome";
import { VisitLogger } from "@/components/site/VisitLogger";
import { getSiteData } from "@/lib/content/store";
import { pageRobots } from "@/lib/robots-policy";

import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const displayFont = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
    robots: pageRobots,
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
    <html lang="sv" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <VisitLogger />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
