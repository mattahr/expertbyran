import type { Route } from "next";
import Link from "next/link";

import { AreaCard } from "@/components/site/AreaCard";
import { ExpertCard } from "@/components/site/ExpertCard";
import { PageHero } from "@/components/site/PageHero";
import { TeamCard } from "@/components/site/TeamCard";
import styles from "@/components/site/site.module.css";
import {
  getAreasForExpert,
  getFeaturedExpertAreas,
  getFeaturedExperts,
  getFeaturedTeams,
  getOrderedSiteData,
} from "@/lib/content/query";

export default async function HomePage() {
  const data = await getOrderedSiteData();
  const featuredAreas = await getFeaturedExpertAreas();
  const featuredTeams = await getFeaturedTeams();
  const featuredExperts = await getFeaturedExperts();

  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow={data.site.hero.eyebrow}
        title={data.site.hero.title}
        intro={data.site.hero.intro}
        primaryAction={data.site.hero.primaryCta}
        secondaryAction={data.site.hero.secondaryCta}
        asideLabel="Organisationsmodell"
        asideValue={data.organization.modelDescription}
      />

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <div>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>Byrån i korthet</p>
                <h2 className={styles.sectionTitle}>{data.organization.heading}</h2>
              </div>
            </div>
            <p className={styles.sectionText}>{data.organization.summary}</p>
            <ul className={styles.pillList}>
              {data.site.principles.map((principle) => (
                <li key={principle} className={styles.pill}>
                  {principle}
                </li>
              ))}
            </ul>
          </div>

          <aside className={styles.statPanel}>
            <ul className={styles.metricList}>
              {data.organization.operations.map((operation) => (
                <li key={operation.label} className={styles.metricItem}>
                  <span className={styles.metricValue}>{operation.value}</span>
                  <span className={styles.metricLabel}>{operation.label}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Expertområden</p>
            <h2 className={styles.sectionTitle}>Expertområden i nuvarande organisation.</h2>
          </div>
          <Link href="/expertomraden" className={styles.sectionLink}>
            Visa alla områden
          </Link>
        </div>
        <div className={styles.gridCards}>
          {featuredAreas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Kuraterade team</p>
            <h2 className={styles.sectionTitle}>Fasta team med gemensam prompt och tydlig expertmix.</h2>
          </div>
          <Link href={"/team" as Route} className={styles.sectionLink}>
            Visa alla team
          </Link>
        </div>
        <div className={styles.gridCards}>
          {featuredTeams.map((team) => (
            <TeamCard key={team.id} team={team} expertCount={team.expertSlugs.length} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Utvalda experter</p>
            <h2 className={styles.sectionTitle}>Profiler med tydligt mandat och definierat ansvar.</h2>
          </div>
        </div>
        <div className={styles.gridCards} data-dense="true">
          {featuredExperts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} areas={getAreasForExpert(data, expert)} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <div className={styles.detailBlock}>
            <p className={styles.eyebrow}>Marknadsplats</p>
            <h2 className={styles.sectionTitle}>Extern pluginmarknadsplats med samma expertkatalog.</h2>
            <p className={styles.sectionText}>{data.marketplace.description}</p>
            <div className={styles.heroActions}>
              <Link href={"/marknadsplats" as Route} className={styles.buttonPrimary}>
                Se installationsinformation
              </Link>
              <a href={data.marketplace.repositoryUrl} className={styles.buttonSecondary}>
                Öppna monorepo
              </a>
            </div>
          </div>
          <div className={styles.timeline}>
            {data.organization.workflow.map((step) => (
              <article key={step.title} className={styles.timelineItem}>
                <h3 className={styles.timelineTitle}>{step.title}</h3>
                <p className={styles.timelineText}>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <div className={styles.detailBlock}>
            <p className={styles.eyebrow}>Kontakt</p>
            <h2 className={styles.sectionTitle}>Operativ kontakt hanteras separat från webbplatsen.</h2>
            <p className={styles.sectionText}>{data.contact.intro}</p>
            <div className={styles.heroActions}>
              <Link href="/kontakt" className={styles.buttonSecondary}>
                Läs om kontaktmodellen
              </Link>
            </div>
          </div>
          <div className={styles.timeline}>
            {data.contact.channels.map((channel) => (
              <article key={channel.id} className={styles.timelineItem}>
                <h3 className={styles.timelineTitle}>{channel.label}</h3>
                <p className={styles.timelineText}>{channel.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
