"use client";

import { useEffect, useState } from "react";

import { RINGS } from "@/lib/radar/rings";
import type { Blip, RadarMeta, Segment } from "@/lib/radar/schema";

import styles from "@/app/admin/admin.module.css";
import { AreaPicker, type AreaOption } from "./AreaPicker";

interface RadarDraft {
  meta: RadarMeta;
  blips: Blip[];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function validate(d: RadarDraft): string[] {
  const errors: string[] = [];
  if (!d.meta.title.trim()) errors.push("Titel saknas.");
  if (Number.isNaN(Date.parse(d.meta.date))) errors.push("Ogiltigt datum (ISO).");
  if (d.meta.segments.length < 4 || d.meta.segments.length > 6) {
    errors.push("Radarn måste ha 4–6 segment.");
  }
  const segIds = new Set<string>();
  for (const s of d.meta.segments) {
    if (!s.name.trim()) errors.push(`Ett segment saknar namn.`);
    if (segIds.has(s.id)) errors.push(`Segment-id '${s.id}' är inte unikt.`);
    segIds.add(s.id);
  }
  const blipIds = new Set<string>();
  for (const b of d.blips) {
    const label = b.name || b.id;
    if (!b.name.trim()) errors.push(`En blip saknar namn.`);
    if (blipIds.has(b.id)) errors.push(`Blip-id '${b.id}' är inte unikt.`);
    blipIds.add(b.id);
    if (!segIds.has(b.segmentId)) errors.push(`Blip '${label}' pekar på ett okänt segment.`);
    if (!b.description.trim()) errors.push(`Blip '${label}' saknar beskrivning.`);
    if (!b.implications.trim()) errors.push(`Blip '${label}' saknar implikationer.`);
  }
  return errors;
}

function nextId(prefix: string, used: Set<string>): string {
  let n = used.size + 1;
  let id = `${prefix}-${n}`;
  while (used.has(id)) {
    n += 1;
    id = `${prefix}-${n}`;
  }
  return id;
}

export function RadarAdmin() {
  const [radars, setRadars] = useState<RadarMeta[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<RadarDraft | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [list, siteData] = await Promise.all([
        fetch("/api/v1/radars").then((r) => r.json()),
        fetch("/api/v1/site-data")
          .then((r) => r.json())
          .catch(() => ({ expertAreas: [] })),
      ]);
      setRadars(list.radars ?? []);
      setAreas(siteData.expertAreas ?? []);
    } catch {
      setStatus("Kunde inte ladda radarer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function startEdit(slug: string) {
    setEditing(slug);
    setStatus(null);
    setErrors([]);
    setDraft(null);
    try {
      const data = await fetch(`/api/v1/radars/${slug}`).then((r) => r.json());
      setDraft({ meta: data.meta, blips: data.blips ?? [] });
    } catch {
      setStatus("Kunde inte ladda radarn.");
    }
  }

  function cancel() {
    setEditing(null);
    setDraft(null);
    setErrors([]);
  }

  const setMeta = (patch: Partial<RadarMeta>) =>
    setDraft((d) => (d ? { ...d, meta: { ...d.meta, ...patch } } : d));

  const updateSegment = (i: number, patch: Partial<Segment>) =>
    setDraft((d) =>
      d ? { ...d, meta: { ...d.meta, segments: d.meta.segments.map((s, j) => (j === i ? { ...s, ...patch } : s)) } } : d,
    );

  const addSegment = () =>
    setDraft((d) => {
      if (!d || d.meta.segments.length >= 6) return d;
      const id = nextId("segment", new Set(d.meta.segments.map((s) => s.id)));
      return { ...d, meta: { ...d.meta, segments: [...d.meta.segments, { id, name: "" }] } };
    });

  const removeSegment = (i: number) =>
    setDraft((d) => (d ? { ...d, meta: { ...d.meta, segments: d.meta.segments.filter((_, j) => j !== i) } } : d));

  const updateBlip = (i: number, patch: Partial<Blip>) =>
    setDraft((d) => (d ? { ...d, blips: d.blips.map((b, j) => (j === i ? { ...b, ...patch } : b)) } : d));

  const addBlip = () =>
    setDraft((d) => {
      if (!d) return d;
      const id = nextId("blip", new Set(d.blips.map((b) => b.id)));
      const blip: Blip = {
        id,
        name: "",
        segmentId: d.meta.segments[0]?.id ?? "",
        ring: "bevaka",
        description: "",
        implications: "",
      };
      return { ...d, blips: [...d.blips, blip] };
    });

  const removeBlip = (i: number) => setDraft((d) => (d ? { ...d, blips: d.blips.filter((_, j) => j !== i) } : d));

  async function save() {
    if (!draft || !editing) return;
    const errs = validate(draft);
    setErrors(errs);
    if (errs.length) return;
    const res = await fetch(`/api/v1/radars/${editing}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ meta: draft.meta, blips: draft.blips }),
    });
    if (res.ok) {
      setStatus("Radarn sparades.");
      cancel();
      void load();
    } else {
      const e = await res.json().catch(() => ({}));
      setStatus(`Kunde inte spara: ${e.error ?? res.status}`);
    }
  }

  async function remove(slug: string, title: string) {
    if (!window.confirm(`Radera radarn "${title}"? Detta går inte att ångra.`)) return;
    const res = await fetch(`/api/v1/radars/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setStatus("Radarn raderades.");
      void load();
    } else {
      setStatus(`Kunde inte radera (${res.status}).`);
    }
  }

  if (loading) return <p className={styles.empty}>Laddar…</p>;

  return (
    <div>
      {status && <p className={styles.statusMsg}>{status}</p>}
      {radars.length === 0 && <p className={styles.empty}>Inga radarer ännu.</p>}

      {radars.map((radar) => (
        <div key={radar.slug}>
          <div className={styles.blogRow}>
            <div>
              <div className={styles.blogTitle}>{radar.title}</div>
              <div className={styles.blogMeta}>
                {radar.date.slice(0, 10)} · {radar.segments.length} segment
                {radar.version ? ` · v${radar.version}` : ""}
              </div>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.smallBtn} onClick={() => startEdit(radar.slug)}>
                Redigera
              </button>
              <button type="button" className={styles.dangerBtn} onClick={() => remove(radar.slug, radar.title)}>
                Radera
              </button>
            </div>
          </div>

          {editing === radar.slug && draft && (
            <div className={styles.editGrid}>
              <Field label="Titel">
                <input className={styles.input} value={draft.meta.title} onChange={(e) => setMeta({ title: e.target.value })} />
              </Field>
              <Field label="Undertitel (valfritt)">
                <input
                  className={styles.input}
                  value={draft.meta.subtitle ?? ""}
                  onChange={(e) => setMeta({ subtitle: e.target.value || undefined })}
                />
              </Field>
              <div className={styles.twoCol}>
                <Field label="Version (valfritt)">
                  <input
                    className={styles.input}
                    value={draft.meta.version ?? ""}
                    onChange={(e) => setMeta({ version: e.target.value || undefined })}
                  />
                </Field>
                <Field label="Datum (ISO)">
                  <input className={styles.input} value={draft.meta.date} onChange={(e) => setMeta({ date: e.target.value })} />
                </Field>
              </div>

              {/* Segment */}
              <div className={styles.subEditor}>
                <div className={styles.subTitle}>Segment ({draft.meta.segments.length} av 4–6)</div>
                {draft.meta.segments.map((seg, i) => (
                  <div key={seg.id} className={styles.segmentRow}>
                    <input
                      className={styles.input}
                      placeholder="Segmentnamn"
                      value={seg.name}
                      onChange={(e) => updateSegment(i, { name: e.target.value })}
                    />
                    <span className={styles.idTag}>{seg.id}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => removeSegment(i)} aria-label="Ta bort segment">
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={addSegment}
                  disabled={draft.meta.segments.length >= 6}
                >
                  + Lägg till segment
                </button>
              </div>

              {/* Blips */}
              <div className={styles.subEditor}>
                <div className={styles.subTitle}>Blips ({draft.blips.length})</div>
                {draft.blips.map((blip, i) => (
                  <div key={blip.id} className={styles.blipCard}>
                    <div className={styles.twoCol}>
                      <Field label="Namn">
                        <input className={styles.input} value={blip.name} onChange={(e) => updateBlip(i, { name: e.target.value })} />
                      </Field>
                      <div className={styles.twoCol}>
                        <Field label="Segment">
                          <select
                            className={styles.input}
                            value={blip.segmentId}
                            onChange={(e) => updateBlip(i, { segmentId: e.target.value })}
                          >
                            {draft.meta.segments.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name || s.id}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Ring">
                          <select
                            className={styles.input}
                            value={blip.ring}
                            onChange={(e) => updateBlip(i, { ring: e.target.value as Blip["ring"] })}
                          >
                            {RINGS.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>
                    <Field label="Beskrivning">
                      <textarea
                        className={styles.input}
                        rows={2}
                        value={blip.description}
                        onChange={(e) => updateBlip(i, { description: e.target.value })}
                      />
                    </Field>
                    <Field label="Implikationer">
                      <textarea
                        className={styles.input}
                        rows={2}
                        value={blip.implications}
                        onChange={(e) => updateBlip(i, { implications: e.target.value })}
                      />
                    </Field>
                    <AreaPicker
                      areas={areas}
                      selected={blip.areaSlugs ?? []}
                      onChange={(slugs) => updateBlip(i, { areaSlugs: slugs.length ? slugs : undefined })}
                      label="Expertområden (valfritt)"
                      requireOne={false}
                    />
                    <button type="button" className={styles.removeBtn} onClick={() => removeBlip(i)}>
                      ✕ Ta bort blip
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={addBlip}>
                  + Lägg till blip
                </button>
              </div>

              {errors.length > 0 && (
                <ul className={styles.errorList}>
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}

              <div className={styles.rowActions}>
                <button type="button" className={styles.button} onClick={save}>
                  Spara
                </button>
                <button type="button" className={styles.smallBtn} onClick={cancel}>
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
