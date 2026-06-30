import type { TimePoint } from "@/lib/stores/types";

import styles from "@/app/admin/admin.module.css";

const W = 820;
const H = 200;
const PAD = 22;

export function TimeseriesChart({ points }: { points: TimePoint[] }) {
  if (points.length === 0) return <p className={styles.empty}>Ingen data i perioden.</p>;

  const max = Math.max(1, ...points.map((p) => p.pageviews));
  const stepX = points.length > 1 ? (W - PAD * 2) / (points.length - 1) : 0;
  const x = (i: number) => PAD + i * stepX;
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.pageviews).toFixed(1)}`)
    .join(" ");
  const lastX = x(points.length - 1);
  const area = `${line} L${lastX.toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Sidvisningar per dag">
      <path d={area} className={styles.chartArea} />
      <path d={line} className={styles.chartLine} />
      {points.length <= 60
        ? points.map((p, i) => (
            <circle key={p.day} cx={x(i)} cy={y(p.pageviews)} r={2.5} className={styles.chartDot}>
              <title>{`${p.day}: ${p.pageviews} sidvisningar, ${p.visitors} unika`}</title>
            </circle>
          ))
        : null}
    </svg>
  );
}
