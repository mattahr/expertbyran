"use client";

import { useState } from "react";

import { shiftDays } from "@/lib/admin/date-range";
import type { TimePoint } from "@/lib/stores/types";

import styles from "@/app/admin/admin.module.css";

const W = 820;
const H = 240;
const PAD_L = 44; // plats för y-axelns etiketter
const PAD = 22; // topp + höger
const PAD_B = 34; // plats för x-axelns datumetiketter

function tickValues(max: number): number[] {
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i);
  return [...new Set([0, 1, 2, 3, 4].map((i) => Math.round((max * i) / 4)))];
}

// Nollfyller dagar utan besök så att X-axeln blir linjär i tid — SQL:ens
// GROUP BY day hoppar annars över tomma dagar och trycker ihop luckorna.
function fillDays(points: TimePoint[], from?: string, to?: string): TimePoint[] {
  const byDay = new Map(points.map((p) => [p.day, p]));
  const start = from ?? points[0].day;
  const end = to ?? points[points.length - 1].day;
  if (start > end) return points;
  const out: TimePoint[] = [];
  for (let day = start; day <= end; day = shiftDays(day, 1)) {
    out.push(byDay.get(day) ?? { day, pageviews: 0, visitors: 0 });
  }
  return out;
}

// ~`target` jämnt fördelade indexpositioner, alltid inkl. första och sista dagen.
function xTickIndices(n: number, target = 6): number[] {
  if (n <= target) return Array.from({ length: n }, (_, i) => i);
  return [...new Set(Array.from({ length: target }, (_, k) => Math.round((k * (n - 1)) / (target - 1))))];
}

const fmtShort = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
const fmtLong = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function TimeseriesChart({ points, from, to }: { points: TimePoint[]; from?: string; to?: string }) {
  const [hover, setHover] = useState<{ i: number; px: number; py: number; w: number } | null>(null);

  if (points.length === 0) return <p className={styles.empty}>Ingen data i perioden.</p>;

  const days = fillDays(points, from, to);
  const max = Math.max(1, ...days.map((p) => p.pageviews));
  const stepX = days.length > 1 ? (W - PAD_L - PAD) / (days.length - 1) : 0;
  const x = (i: number) => PAD_L + i * stepX;
  const y = (v: number) => H - PAD_B - (v / max) * (H - PAD - PAD_B);

  const line = days
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.pageviews).toFixed(1)}`)
    .join(" ");
  const lastX = x(days.length - 1);
  const area = `${line} L${lastX.toFixed(1)},${H - PAD_B} L${x(0).toFixed(1)},${H - PAD_B} Z`;

  const ticks = tickValues(max);
  const xTicks = xTickIndices(days.length);

  // Tooltip direkt vid hovring: närmaste dag räknas ut från muspositionen,
  // så hela diagramytan är träffyta — ingen fördröjning, inga små mål.
  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const i = stepX > 0 ? Math.round((vx - PAD_L) / stepX) : 0;
    if (i < 0 || i >= days.length) {
      setHover(null);
      return;
    }
    setHover({ i, px: e.clientX - rect.left, py: e.clientY - rect.top, w: rect.width });
  }

  const h = hover ? days[hover.i] : null;

  return (
    <div className={styles.chartWrap}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
        role="img"
        aria-label="Sidvisningar per dag"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Y-axelns rutnät + värden */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_L} y1={y(t)} x2={W - PAD} y2={y(t)} className={styles.chartGrid} />
            <text x={PAD_L - 8} y={y(t) + 3} textAnchor="end" className={styles.chartAxis}>
              {t}
            </text>
          </g>
        ))}
        {/* X-axelns datumetiketter */}
        {xTicks.map((i) => (
          <text key={days[i].day} x={x(i)} y={H - PAD_B + 16} textAnchor="middle" className={styles.chartAxis}>
            {fmtShort(days[i].day)}
          </text>
        ))}
        <path d={area} className={styles.chartArea} />
        <path d={line} className={styles.chartLine} />
        {days.length <= 60
          ? days.map((p, i) => (
              <circle key={p.day} cx={x(i)} cy={y(p.pageviews)} r={2.5} className={styles.chartDot} />
            ))
          : null}
        {hover && h ? (
          <g>
            <line
              x1={x(hover.i)}
              y1={PAD}
              x2={x(hover.i)}
              y2={H - PAD_B}
              className={styles.chartHoverLine}
            />
            <circle cx={x(hover.i)} cy={y(h.pageviews)} r={4} className={styles.chartHoverDot} />
          </g>
        ) : null}
      </svg>
      {hover && h ? (
        <div
          className={styles.chartTooltip}
          style={{
            left: hover.px,
            top: hover.py,
            // Klipp inte tooltippen vid kanterna: vänsterställ nära vänsterkanten,
            // högerställ nära högerkanten, annars centrerad över markören.
            // Nära överkanten visas den under markören i stället för ovanför.
            transform: `translate(${
              hover.px < 100 ? "0" : hover.px > hover.w - 100 ? "-100%" : "-50%"
            }, ${hover.py < 56 ? "14px" : "calc(-100% - 12px)"})`,
          }}
        >
          <div className={styles.chartTooltipTitle}>{fmtLong(h.day)}</div>
          {h.pageviews.toLocaleString("sv-SE")} sidvisningar · {h.visitors.toLocaleString("sv-SE")} unika
        </div>
      ) : null}
    </div>
  );
}
