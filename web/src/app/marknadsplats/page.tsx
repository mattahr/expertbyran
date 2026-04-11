import type { Route } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";
import type { InstallSource } from "@/lib/content/schema";

function formatInstallSource(source: InstallSource) {
  return JSON.stringify(source, null, 2);
}

export const metadata = {
  title: "Marknadsplats",
};

export default async function MarketplacePage() {
  const data = await getOrderedSiteData();
  const listedExperts = data.experts.filter((expert) => expert.plugin.marketplaceListed);
  const listedTeams = data.teams.filter((team) => team.plugin.marketplaceListed);

  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow="Extern marketplace"
        title="Katalog för en extern Claude Code-marketplace."
        intro={data.marketplace.description}
        primaryAction={{ href: data.marketplace.repositoryUrl, label: "Öppna monorepo" }}
        secondaryAction={{ href: data.marketplace.marketplaceJsonUrl, label: "Öppna marketplace.json" }}
        asideLabel="Installationskälla"
        asideValue={`${data.marketplace.installSource.source}: ${
          "repo" in data.marketplace.installSource
            ? data.marketplace.installSource.repo
            : "url" in data.marketplace.installSource
              ? data.marketplace.installSource.url
              : data.marketplace.installSource.package
        }`}
      />

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <article className={styles.detailBlock}>
            <p className={styles.eyebrow}>Översikt</p>
            <h2 className={styles.sectionTitle}>Vad webbappen äger och vad som ligger externt.</h2>
            <p className={styles.sectionText}>
              Den här webbplatsen exponerar CV, teambeskrivningar och validerad pluginmetadata. Den
              publicerar inte pluginfiler och genererar inte den kanoniska marketplace-katalogen.
            </p>
            <ul className={styles.detailList}>
              <li>Monorepo: {data.marketplace.repositoryUrl}</li>
              <li>Kanonisk marketplace: {data.marketplace.marketplaceJsonUrl}</li>
              <li>Listade expertplugins: {listedExperts.length}</li>
              <li>Listade teamplugins: {listedTeams.length}</li>
            </ul>
          </article>

          <article className={styles.detailBlock}>
            <p className={styles.eyebrow}>Claude Code-källa</p>
            <h2 className={styles.sectionTitle}>Den source som ska läggas till hos kunden.</h2>
            <pre className={styles.codeBlock}>{formatInstallSource(data.marketplace.installSource)}</pre>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Schema och kontrakt</p>
            <h2 className={styles.sectionTitle}>Publika schemafiler för vidareutveckling.</h2>
          </div>
        </div>
        <div className={styles.gridCards}>
          <article className={styles.card}>
            <p className={styles.cardMeta}>Site snapshot</p>
            <h3 className={styles.cardTitle}>site-data.schema.json</h3>
            <p className={styles.cardText}>
              Fullständig schemafil för det snapshotformat som webbplatsen läser från GitHub.
            </p>
            <a href="/schemas/site-data.schema.json" className={styles.textLink}>
              Öppna publik schemafil
            </a>
          </article>

          <article className={styles.card}>
            <p className={styles.cardMeta}>Pluginsynk</p>
            <h3 className={styles.cardTitle}>plugin-sync.schema.json</h3>
            <p className={styles.cardText}>
              Maskinläsbart kontrakt för kopplingen mellan experter, team och pluginmetadata i
              monorepot.
            </p>
            <a href="/schemas/plugin-sync.schema.json" className={styles.textLink}>
              Öppna publik schemafil
            </a>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Katalog</p>
            <h2 className={styles.sectionTitle}>Utforska team och experter som motsvarar plugins.</h2>
          </div>
        </div>
        <div className={styles.metaStack}>
          <Link href={"/team" as Route} className={styles.metaPanel}>
            <span className={styles.contactLabel}>Kuraterade team</span>
            <span className={styles.contactDescription}>
              Visa teamkatalogen och se vilka experter som ingår i varje teamplugin.
            </span>
          </Link>
          <Link href={"/expertomraden" as Route} className={styles.metaPanel}>
            <span className={styles.contactLabel}>Expertområden</span>
            <span className={styles.contactDescription}>
              Utforska taxonomin som ligger bakom expert- och teamstrukturen.
            </span>
          </Link>
          <Link href={"/kontakt" as Route} className={styles.metaPanel}>
            <span className={styles.contactLabel}>Kontaktmodell</span>
            <span className={styles.contactDescription}>
              Läs hur extern kontakt och operativ samverkan hanteras utanför webbplatsen.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
