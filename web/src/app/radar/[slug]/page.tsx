import type { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
import { getRadar } from "@/lib/radar/query";
import { RadarChart } from "./RadarChart";

type RadarPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RadarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const radar = await getRadar(slug);
  if (!radar) return { title: "Radar saknas" };
  return { title: radar.meta.title, description: radar.meta.subtitle };
}

export default async function RadarDetailPage({ params }: RadarPageProps) {
  const { slug } = await params;
  const radar = await getRadar(slug);
  if (!radar) notFound();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Radar</p>
        <h1 className={styles.heroTitle}>{radar.meta.title}</h1>
        <div className={styles.heroLine} />
        {radar.meta.subtitle ? <p className={styles.heroIntro}>{radar.meta.subtitle}</p> : null}
      </div>

      <section className={styles.section}>
        <RadarChart segments={radar.meta.segments} blips={radar.blips} />
      </section>
    </div>
  );
}
