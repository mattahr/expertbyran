"use client";

import { useRef, useState } from "react";

import styles from "@/app/admin/admin.module.css";

export interface DonutSlice {
  label: string;
  value: number;
  filterValue?: string;
}

const COLORS = ["#1d4e74", "#0e7c7b", "#d4982b", "#0c2236", "#64718a", "#93a0b4", "#163c59", "#92651a"];

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const [x1, y1] = polar(cx, cy, rOuter, start);
  const [x2, y2] = polar(cx, cy, rOuter, end);
  const [x3, y3] = polar(cx, cy, rInner, end);
  const [x4, y4] = polar(cx, cy, rInner, start);
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${rInner},${rInner} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`;
}

export function DonutChart({ slices, onSelect }: { slices: DonutSlice[]; onSelect?: (value: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; px: number; py: number } | null>(null);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return <p className={styles.empty}>Ingen data i perioden.</p>;

  const cx = 80;
  const cy = 80;
  const arcs = slices.map((s, i) => {
    // Startvinkel = prefix-summan av tidigare slices (rena beräkningar, ingen mutation).
    const before = slices.slice(0, i).reduce((sum, x) => sum + x.value, 0);
    const start = -Math.PI / 2 + (before / total) * 2 * Math.PI;
    const end = start + (s.value / total) * 2 * Math.PI;
    return {
      ...s,
      color: COLORS[i % COLORS.length],
      d: arcPath(cx, cy, 72, 44, start, Math.max(start + 0.0001, end - 0.0001)),
      pct: Math.round((s.value / total) * 100),
    };
  });

  // Tooltip direkt vid hovring — muspositionen räknas relativt omslaget
  // så att tooltippen kan följa markören över tårtbitarna utan fördröjning.
  function moveTo(i: number) {
    return (e: React.MouseEvent<SVGPathElement>) => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHover({ i, px: e.clientX - rect.left, py: e.clientY - rect.top });
    };
  }

  const h = hover ? arcs[hover.i] : null;

  return (
    <div className={styles.donutWrap} ref={wrapRef}>
      <svg viewBox="0 0 160 160" className={styles.donut} role="img" aria-label="Fördelning">
        {arcs.map((a, i) => (
          <path
            key={a.label}
            d={a.d}
            fill={a.color}
            onMouseEnter={moveTo(i)}
            onMouseMove={moveTo(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        <text x={cx} y={cy - 2} textAnchor="middle" className={styles.donutTotal}>
          {total.toLocaleString("sv-SE")}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className={styles.donutTotalLabel}>
          visningar
        </text>
      </svg>
      {hover && h ? (
        <div
          className={styles.chartTooltip}
          style={{
            left: hover.px,
            top: hover.py,
            transform: `translate(${hover.px < 100 ? "0" : "-50%"}, ${
              hover.py < 56 ? "14px" : "calc(-100% - 12px)"
            })`,
          }}
        >
          <div className={styles.chartTooltipTitle}>{h.label}</div>
          {h.value.toLocaleString("sv-SE")} visningar · {h.pct} %
        </div>
      ) : null}
      <ul className={styles.donutLegend}>
        {arcs.map((a) => {
          const row = (
            <>
              <span className={styles.legendDot} style={{ background: a.color }} />
              <span className={styles.legendLabel}>{a.label}</span>
              <span className={styles.legendVal}>
                {a.value.toLocaleString("sv-SE")} · {a.pct}%
              </span>
            </>
          );
          return (
            <li key={a.label}>
              {onSelect ? (
                <button type="button" className={styles.legendBtn} onClick={() => onSelect(a.filterValue ?? a.label)}>
                  {row}
                </button>
              ) : (
                <div className={styles.legendBtn}>{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
