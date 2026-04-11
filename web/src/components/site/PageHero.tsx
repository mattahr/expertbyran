import type { Route } from "next";
import Link from "next/link";

import styles from "./site.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  asideLabel?: string;
  asideValue?: string;
};

function isInternalHref(href: string): href is Route {
  return href.startsWith("/");
}

function ActionLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  primaryAction,
  secondaryAction,
  asideLabel,
  asideValue,
}: PageHeroProps) {
  return (
    <section className={styles.pageHero}>
      <div className={styles.pageHeroGrid}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroIntro}>{intro}</p>

          {(primaryAction || secondaryAction) && (
            <div className={styles.heroActions}>
              {primaryAction ? (
                <ActionLink
                  href={primaryAction.href}
                  label={primaryAction.label}
                  className={styles.buttonPrimary}
                />
              ) : null}

              {secondaryAction ? (
                <ActionLink
                  href={secondaryAction.href}
                  label={secondaryAction.label}
                  className={styles.buttonSecondary}
                />
              ) : null}
            </div>
          )}
        </div>

        {asideLabel && asideValue ? (
          <div className={styles.heroAside}>
            <p className={styles.heroAsideLabel}>{asideLabel}</p>
            <p className={styles.heroAsideValue}>{asideValue}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
