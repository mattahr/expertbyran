"use client";

import { useState } from "react";

import type { Blip, Segment } from "@/lib/radar/schema";
import { RINGS, RING_BY_ID, type RingId } from "@/lib/radar/rings";
import styles from "./RadarChart.module.css";

const C = 450;
const R_MAX = 400;
const RING_EDGES = [0, 110, 205, 300, R_MAX];
const SEG_GAP_DEG = 2; // halv lucka mellan tårtbitarna
const SEG_COLORS = ["#1d4e74", "#0e7c7b", "#d4982b", "#64718a", "#92651a", "#11314c"];

// Delar cirkeln i N lika stora tårtbitar. Segment 0 hamnar i övre högra
// kvadranten (samma utgångspunkt som 4-segmentsfallet).
function segmentGeometry(count: number) {
  const span = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const center = -90 + span / 2 + i * span;
    return {
      center,
      a0: center - span / 2 + SEG_GAP_DEG,
      a1: center + span / 2 - SEG_GAP_DEG,
      color: SEG_COLORS[i % SEG_COLORS.length],
    };
  });
}

type PlacedBlip = Blip & { x: number; y: number; number: number };

function placeBlips(segments: Segment[], blips: Blip[]): PlacedBlip[] {
  const segIndex = new Map(segments.map((segment, index) => [segment.id, index]));
  const ringIndex = new Map<RingId, number>(RINGS.map((ring, index) => [ring.id, index]));
  const geom = segmentGeometry(segments.length);

  // Gruppera på segment+ring för jämn vinkelfördelning inom varje band.
  const groups = new Map<string, Blip[]>();
  blips.forEach((blip) => {
    const key = `${blip.segmentId}|${blip.ring}`;
    const list = groups.get(key) ?? [];
    list.push(blip);
    groups.set(key, list);
  });

  const placed: PlacedBlip[] = [];
  let counter = 0;
  groups.forEach((group, key) => {
    const [segmentId, ring] = key.split("|");
    const seg = segIndex.get(segmentId);
    const ringNo = ringIndex.get(ring as RingId);
    if (seg === undefined || ringNo === undefined) return;
    const g = geom[seg];
    const [a0, a1] = [g.a0, g.a1];
    const rIn = RING_EDGES[ringNo] + 22;
    const rOut = RING_EDGES[ringNo + 1] - 16;
    group.forEach((blip, i) => {
      const frac = (i + 1) / (group.length + 1);
      const ang = ((a0 + (a1 - a0) * frac) * Math.PI) / 180;
      const rr = rIn + (rOut - rIn) * (0.35 + 0.5 * (i % 2));
      placed.push({
        ...blip,
        number: (counter += 1),
        x: C + rr * Math.cos(ang),
        y: C + rr * Math.sin(ang),
      });
    });
  });
  return placed;
}

export function RadarChart({ segments, blips }: { segments: Segment[]; blips: Blip[] }) {
  const geom = segmentGeometry(segments.length);
  const placed = placeBlips(segments, blips);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = placed.find((blip) => blip.id === selectedId) ?? null;
  const selectedSegment = selected
    ? segments.find((segment) => segment.id === selected.segmentId)
    : null;

  return (
    <div className={styles.layout}>
      <div className={styles.radarCard}>
        <svg viewBox="0 0 900 900" className={styles.svg} aria-label="Radar">
          {RING_EDGES.slice(1)
            .map((edge, i) => ({ edge, ring: RINGS[i] }))
            .reverse()
            .map(({ edge, ring }) => (
              <circle
                key={ring.id}
                cx={C}
                cy={C}
                r={edge}
                fill={ring.color}
                fillOpacity={0.07}
                stroke="#e2e7ef"
                strokeWidth={1}
              />
            ))}
          {[0, 90, 180, 270].map((deg) => {
            const r = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={C}
                y1={C}
                x2={C + R_MAX * Math.cos(r)}
                y2={C + R_MAX * Math.sin(r)}
                stroke="#e2e7ef"
                strokeWidth={1}
              />
            );
          })}
          {RINGS.map((ring, i) => {
            const r = (RING_EDGES[i] + RING_EDGES[i + 1]) / 2;
            return (
              <text key={ring.id} x={C + 4} y={C - r + 4} className={styles.ringLabel} textAnchor="start">
                {ring.label}
              </text>
            );
          })}
          {segments.map((segment, i) => {
            const r = (geom[i].center * Math.PI) / 180;
            return (
              <text
                key={segment.id}
                x={C + (R_MAX - 24) * Math.cos(r)}
                y={C + (R_MAX - 24) * Math.sin(r)}
                className={styles.segLabel}
                fill={geom[i].color}
                textAnchor="middle"
              >
                {segment.name}
              </text>
            );
          })}
          {placed.map((blip) => (
            <g
              key={blip.id}
              className={`${styles.blip} ${selectedId === blip.id ? styles.blipActive : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${blip.name} — ${RING_BY_ID[blip.ring].label}`}
              onClick={() => setSelectedId(blip.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedId(blip.id);
                }
              }}
            >
              <circle cx={blip.x} cy={blip.y} r={14} fill={RING_BY_ID[blip.ring].color} />
              <text x={blip.x} y={blip.y + 4} textAnchor="middle" className={styles.blipNumber}>
                {blip.number}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <aside className={styles.side}>
        <div className={styles.legend}>
          <h3 className={styles.legendTitle}>Hållning</h3>
          {RINGS.map((ring) => (
            <div key={ring.id} className={styles.legRow}>
              <span className={styles.dot} style={{ background: ring.color }} aria-hidden />
              <b>{ring.label}</b> – {ring.blurb}
            </div>
          ))}
        </div>

        <div className={styles.detail}>
          {selected ? (
            <>
              <span className={styles.dTag}>
                <span className={styles.dot} style={{ background: RING_BY_ID[selected.ring].color }} aria-hidden />
                {RING_BY_ID[selected.ring].label}
              </span>
              <h2 className={styles.dTitle}>
                {selected.number}. {selected.name}
              </h2>
              {selectedSegment ? <div className={styles.dSeg}>{selectedSegment.name}</div> : null}
              <p className={styles.dDesc}>{selected.description}</p>
              <div className={styles.dSub}>Implikationer</div>
              <p className={styles.dImpact}>{selected.implications}</p>
            </>
          ) : (
            <div className={styles.empty}>
              <span>Välj en signal</span>
              Klicka på en punkt i radarn för att se hållning, beskrivning och implikationer.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
