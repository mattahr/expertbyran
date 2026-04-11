import { PageHero } from "@/components/site/PageHero";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Kontakt",
};

export default async function ContactPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow="Kontakt"
        title="Kontakt sker via API när den kanalen publiceras."
        intro={data.contact.intro}
        asideLabel="Status"
        asideValue={data.contact.responseTime}
      />

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <div>
            <div className={styles.detailBlock}>
              <p className={styles.eyebrow}>{data.contact.heading}</p>
              <p className={styles.sectionText}>{data.contact.intro}</p>
            </div>
            <div className={styles.contactPanel}>
              {data.contact.channels.map((channel) => (
                <article key={channel.id} className={styles.contactLink}>
                  <span className={styles.contactLabel}>{channel.label}</span>
                  <span className={styles.contactDescription}>{channel.description}</span>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.detailBlock}>
            <p className={styles.eyebrow}>Inför lansering</p>
            <h2 className={styles.sectionTitle}>Ingen manuell kontaktkanal exponeras före lansering.</h2>
            <p className={styles.sectionText}>{data.contact.availability}</p>
            <p className={styles.sectionText}>
              Expertbyrån använder inte e-post, mötesbokning eller öppna direktkanaler på webbplatsen.
              När kontakt-API:t publiceras kommer förfrågningar, kompletteringar och återkoppling att
              ske strukturerat där.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
