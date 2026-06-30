import styles from "@/app/admin/admin.module.css";

export interface BarItem {
  label: string;
  value: number;
  sub?: string;
}

export function BarList({ items, emptyText = "Ingen data i perioden." }: { items: BarItem[]; emptyText?: string }) {
  if (!items.length) return <p className={styles.empty}>{emptyText}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className={styles.bars}>
      {items.map((it, i) => (
        <div key={`${it.label}-${i}`} className={styles.barRow}>
          <span className={styles.barLabel} title={it.label}>
            {it.label}
            {it.sub ? <span className={styles.barSub}> · {it.sub}</span> : null}
          </span>
          <span className={styles.barValue}>{it.value.toLocaleString("sv-SE")}</span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${(it.value / max) * 100}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}
