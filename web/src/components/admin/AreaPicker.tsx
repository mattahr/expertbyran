"use client";

import styles from "@/app/admin/admin.module.css";

export interface AreaOption {
  slug: string;
  name: string;
}

/** Flerval av expertområden (kryssrutor) — fält som måste ha kända värden. */
export function AreaPicker({
  areas,
  selected,
  onChange,
}: {
  areas: AreaOption[];
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  const chosen = new Set(selected);

  function toggle(slug: string) {
    const next = new Set(chosen);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange([...next]);
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>Expertområden (minst ett)</label>
      <div className={styles.areaGrid}>
        {areas.map((a) => (
          <label key={a.slug} className={styles.areaOption}>
            <input type="checkbox" checked={chosen.has(a.slug)} onChange={() => toggle(a.slug)} />
            <span>{a.name}</span>
          </label>
        ))}
        {areas.length === 0 && <span className={styles.empty}>Inga områden tillgängliga.</span>}
      </div>
      {selected.length === 0 && <p className={styles.hint}>Välj minst ett område för att kunna spara.</p>}
    </div>
  );
}
