import type { Route } from "next";
import Link from "next/link";

import styles from "./site.module.css";

type GridCellProps = {
  href: string;
  category?: string;
  categoryColor?: string;
  name: string;
  description: string;
};

export function GridCell({ href, category, categoryColor, name, description }: GridCellProps) {
  return (
    <Link href={href as Route} className={styles.gridCell}>
      {category ? (
        <span className={styles.gridCellCategory} style={categoryColor ? { color: categoryColor } : undefined}>
          {categoryColor ? (
            <span className={styles.dot} style={{ background: categoryColor }} aria-hidden />
          ) : null}
          {category}
        </span>
      ) : null}
      <span className={styles.gridCellName}>
        {!category && categoryColor ? (
          <span className={styles.dot} style={{ background: categoryColor }} aria-hidden />
        ) : null}
        {name}
      </span>
      {description ? <span className={styles.gridCellDesc}>{description}</span> : null}
      <span className={styles.gridCellArrow} aria-hidden>→</span>
    </Link>
  );
}
