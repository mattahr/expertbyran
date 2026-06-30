"use client";

import styles from "@/app/admin/admin.module.css";

export interface ExpertOption {
  slug: string;
  name: string;
  role?: string;
}

export interface AuthorValue {
  authorSlug?: string;
  authorName?: string;
  authorRole?: string;
}

/**
 * Författarväljare som speglar datamodellen: en författare kan vara en LÄNKAD
 * expert (authorSlug → expertsidan, visar expertens namn/roll) och/eller
 * fritext (authorName/authorRole som överstyr expertens värden).
 */
export function AuthorPicker({
  experts,
  value,
  onChange,
}: {
  experts: ExpertOption[];
  value: AuthorValue;
  onChange: (next: AuthorValue) => void;
}) {
  const expert = experts.find((e) => e.slug === value.authorSlug);
  const shownName = value.authorName || expert?.name;
  const shownRole = value.authorRole || expert?.role;

  return (
    <div className={styles.field}>
      <label className={styles.label}>Författare (expert)</label>
      <select
        className={styles.input}
        value={value.authorSlug ?? ""}
        onChange={(e) => onChange({ ...value, authorSlug: e.target.value || undefined })}
      >
        <option value="">— Ingen (använd fritext nedan) —</option>
        {experts.map((e) => (
          <option key={e.slug} value={e.slug}>
            {e.name}
            {e.role ? ` · ${e.role}` : ""}
          </option>
        ))}
      </select>
      <p className={styles.hint}>
        {expert
          ? `Visar “${shownName}”${shownRole ? `, ${shownRole}` : ""} och länkar till expertsidan.`
          : value.authorName
            ? `Visar “${value.authorName}”${value.authorRole ? `, ${value.authorRole}` : ""} (ingen expertlänk).`
            : "Ingen expert vald — fyll i ett visningsnamn nedan."}
      </p>

      <label className={styles.label}>Visningsnamn (valfritt — överstyr expertens namn)</label>
      <input
        className={styles.input}
        value={value.authorName ?? ""}
        onChange={(e) => onChange({ ...value, authorName: e.target.value || undefined })}
      />

      <label className={styles.label}>Roll (valfritt)</label>
      <input
        className={styles.input}
        value={value.authorRole ?? ""}
        onChange={(e) => onChange({ ...value, authorRole: e.target.value || undefined })}
      />
    </div>
  );
}
