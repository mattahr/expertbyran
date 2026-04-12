import { PageHero } from "@/components/site/PageHero";
import styles from "@/components/site/site.module.css";

const MARKETPLACE_URL = "https://github.com/mattahr/expertbyran";
const MARKETPLACE_REPO = "mattahr/expertbyran";

export const metadata = {
  title: "Marknadsplats",
};

export default function MarketplacePage() {
  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow="Marknadsplats"
        title="github.com/mattahr/expertbyran"
        intro="Expertbyråns marknadsplats finns i GitHub-repot mattahr/expertbyran."
        primaryAction={{ href: MARKETPLACE_URL, label: "Öppna GitHub" }}
        asideLabel="GitHub"
        asideValue={MARKETPLACE_REPO}
      />
    </div>
  );
}
