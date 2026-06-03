# Radar Related Content — Implementation Plan (Etapp 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a radar blip carry expertområden (`areaSlugs`) and show, in the blip detail panel, an automatically-matched "Relaterat" list of foresights and blog posts that share at least one expertområde.

**Architecture:** Add an optional `areaSlugs` field to the blip schema. A new `web/src/lib/radar/related.ts` fetches the foresight + blog archives (both cached) and, for each blip, picks items sharing ≥1 area (newest first, max 5). The radar detail page (server component) precomputes a `relatedByBlip` map and passes it to the existing `RadarChart` client island, which renders a "Relaterat" section when a blip with related items is selected.

**Tech Stack:** Next.js 16.2.3 (App Router), TypeScript 5.9, Zod 4, Vitest 4 (run via `npm run test` from `web/`, NOT global `npx vitest` — it lacks `jsdom`). `@/` maps to `web/src/`.

**Reference spec:** `docs/superpowers/specs/2026-06-03-foresights-and-radar-related-content-design.md` — this plan is **Etapp 2** (blip `areaSlugs` + related panel). Etapp 1 (the foresight content type) is already built and merged on this branch. The blog content type and `getBlogArchive` already exist; foresights and `getForesightArchive` exist from Etapp 1.

**Conventions:** All commands from `web/`. Swedish UI text with correct å/ä/ö. TDD. `npx tsc --noEmit` may show PRE-EXISTING unrelated errors — only errors in touched files matter. Before any build/test that scans files, `rm -rf web/.next` to avoid a stale `.next/standalone` copy of test files polluting vitest.

---

## File Structure

**Create:**
- `web/src/lib/radar/related.ts` — `RelatedItem` type, `getRelatedPool()`, `getRelatedByArea(pool, areaSlugs)` (pure), `getRelatedByBlips(blips)`.
- Test: `web/src/lib/radar/related.test.ts`.

**Modify:**
- `web/src/lib/radar/schema.ts` — add optional `areaSlugs` to `blipSchema`.
- `web/src/lib/radar/schema.test.ts` — add a case for `areaSlugs`.
- `web/src/app/radar/[slug]/RadarChart.tsx` — accept `relatedByBlip` prop, render "Relaterat" section.
- `web/src/app/radar/[slug]/RadarChart.module.css` — styles for the related list.
- `web/src/app/radar/[slug]/RadarChart.test.tsx` — add a related-section test.
- `web/src/app/radar/[slug]/page.tsx` — build `relatedByBlip`, pass it to `RadarChart`.
- `web/radar/teknikradar-2026.json` — add `areaSlugs` to the 16 seed blips.
- `paperclip/skills/local/expertbyran-radar/SKILL.md` — document `areaSlugs` on blips.

---

## Task 1: Add areaSlugs to the blip schema

**Files:**
- Modify: `web/src/lib/radar/schema.ts`
- Modify: `web/src/lib/radar/schema.test.ts`

- [ ] **Step 1: Add a failing test**

In `web/src/lib/radar/schema.test.ts`, add these two cases inside the existing `describe("radar schema", ...)` block (the file already imports `radarInputSchema` and defines `META` with 4 segments incl. ids `ai-agenter`/`infra`/`sakerhet`/`styrning`, and a typed `BLIP`):
```typescript
  it("tillåter areaSlugs på en blip", () => {
    const parsed = radarInputSchema.safeParse({
      meta: META,
      blips: [{ ...BLIP, areaSlugs: ["digitalisering", "cyber"] }],
    });
    expect(parsed.success).toBe(true);
  });

  it("tillåter blip utan areaSlugs (valfritt)", () => {
    const parsed = radarInputSchema.safeParse({ meta: META, blips: [BLIP] });
    expect(parsed.success).toBe(true);
  });
```

- [ ] **Step 2: Run to verify the areaSlugs case fails**

Run: `npm run test -- src/lib/radar/schema.test.ts`
Expected: the "tillåter areaSlugs" test FAILS (Zod strips unknown keys so `success` is true but the field is dropped — actually `z.object` by default strips unknowns, so `safeParse` succeeds and the assertion `success === true` already passes). To make this a real RED test, first confirm the field is preserved: change the assertion to also check the value survives:
```typescript
  it("tillåter areaSlugs på en blip", () => {
    const parsed = radarInputSchema.safeParse({
      meta: META,
      blips: [{ ...BLIP, areaSlugs: ["digitalisering", "cyber"] }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.blips[0].areaSlugs).toEqual(["digitalisering", "cyber"]);
    }
  });
```
Now run `npm run test -- src/lib/radar/schema.test.ts` → expect FAIL: `areaSlugs` is `undefined` (stripped) because the schema doesn't declare it yet.

- [ ] **Step 3: Add the field**

In `web/src/lib/radar/schema.ts`, change `blipSchema` (currently ends `implications: z.string().min(1),`) to include `areaSlugs`:
```typescript
export const blipSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  segmentId: slugSchema,
  ring: ringSchema,
  description: z.string().min(1),
  implications: z.string().min(1),
  areaSlugs: z.array(slugSchema).optional(),
});
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- src/lib/radar/schema.test.ts`
Expected: PASS (all cases, including the two new ones). Also `npx tsc --noEmit` → no new error.

- [ ] **Step 5: Commit**

```bash
git add src/lib/radar/schema.ts src/lib/radar/schema.test.ts
git commit -m "feat(radar): valfritt areaSlugs på blip (tema-nyckel)"
```

---

## Task 2: Related-content query

**Files:**
- Create: `web/src/lib/radar/related.ts`
- Test: `web/src/lib/radar/related.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/lib/radar/related.test.ts`:
```typescript
import { describe, expect, it } from "vitest";

import { getRelatedByArea, type RelatedItem } from "./related";

const POOL: RelatedItem[] = [
  { kind: "foresight", slug: "f-cyber", title: "Cyber-foresight", date: "2026-05-29T00:00:00.000Z", areaSlugs: ["cyber"] },
  { kind: "foresight", slug: "f-old", title: "Gammal", date: "2026-01-01T00:00:00.000Z", areaSlugs: ["digitalisering"] },
  { kind: "blog", slug: "b-dig", title: "Digital blogg", date: "2026-06-01T00:00:00.000Z", areaSlugs: ["digitalisering"] },
  { kind: "blog", slug: "b-other", title: "Annat", date: "2026-06-02T00:00:00.000Z", areaSlugs: ["transport"] },
];

describe("getRelatedByArea", () => {
  it("matchar poster som delar minst ett område", () => {
    const result = getRelatedByArea(POOL, ["digitalisering"]);
    expect(result.map((r) => r.slug)).toEqual(["b-dig", "f-old"]);
  });

  it("returnerar tomt när inget område delas", () => {
    expect(getRelatedByArea(POOL, ["bistand"])).toEqual([]);
  });

  it("sorterar nyast först och blandar foresights + bloggar", () => {
    const result = getRelatedByArea(POOL, ["cyber", "digitalisering"]);
    expect(result.map((r) => r.slug)).toEqual(["b-dig", "f-cyber", "f-old"]);
  });

  it("kapar till max 5", () => {
    const big: RelatedItem[] = Array.from({ length: 8 }, (_, i) => ({
      kind: "blog" as const,
      slug: `b-${i}`,
      title: `B${i}`,
      date: `2026-06-0${(i % 9) + 1}T00:00:00.000Z`,
      areaSlugs: ["cyber"],
    }));
    expect(getRelatedByArea(big, ["cyber"]).length).toBe(5);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- src/lib/radar/related.test.ts`
Expected: FAIL — `Cannot find module './related'`.

- [ ] **Step 3: Write the module**

`web/src/lib/radar/related.ts`:
```typescript
import { getBlogArchive } from "@/lib/blog/query";
import { getForesightArchive } from "@/lib/foresight/query";

export type RelatedItem = {
  kind: "foresight" | "blog";
  slug: string;
  title: string;
  date: string;
  areaSlugs: string[];
};

const MAX_RELATED = 5;

/** Poster som delar minst ett område med blippen, nyast först, max 5. Ren funktion. */
export function getRelatedByArea(pool: RelatedItem[], areaSlugs: string[]): RelatedItem[] {
  const wanted = new Set(areaSlugs);
  return pool
    .filter((item) => item.areaSlugs.some((slug) => wanted.has(slug)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_RELATED);
}

/** Hämtar foresight- + blogg-arkiven (cachade) och normaliserar till RelatedItem[]. */
export async function getRelatedPool(): Promise<RelatedItem[]> {
  const [foresightArchive, blogArchive] = await Promise.all([
    getForesightArchive(),
    getBlogArchive(),
  ]);
  const foresights: RelatedItem[] = foresightArchive.foresights.map((f) => ({
    kind: "foresight",
    slug: f.slug,
    title: f.title,
    date: f.date,
    areaSlugs: f.areaSlugs,
  }));
  const blogs: RelatedItem[] = blogArchive.posts.map((p) => ({
    kind: "blog",
    slug: p.slug,
    title: p.title,
    date: p.date,
    areaSlugs: p.areaSlugs,
  }));
  return [...foresights, ...blogs];
}

/** Bygger en map blip-id → relaterade poster, endast för blips som har areaSlugs. */
export async function getRelatedByBlips(
  blips: { id: string; areaSlugs?: string[] }[],
): Promise<Record<string, RelatedItem[]>> {
  const pool = await getRelatedPool();
  const map: Record<string, RelatedItem[]> = {};
  for (const blip of blips) {
    if (!blip.areaSlugs || blip.areaSlugs.length === 0) continue;
    const related = getRelatedByArea(pool, blip.areaSlugs);
    if (related.length > 0) map[blip.id] = related;
  }
  return map;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- src/lib/radar/related.test.ts`
Expected: PASS (4 tests). Also `npx tsc --noEmit` → no error in the new file. (Confirm `getBlogArchive` is exported from `@/lib/blog/query` returning `{ posts: BlogPostSummary[]; areas }` where `BlogPostSummary` has `slug`/`title`/`date`/`areaSlugs`, and `getForesightArchive` from `@/lib/foresight/query` returns `{ foresights: ForesightSummary[]; areas }` with the same fields — both confirmed in Etapp 1 / existing blog code.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/radar/related.ts src/lib/radar/related.test.ts
git commit -m "feat(radar): related-query (foresights + bloggar via delat område)"
```

---

## Task 3: "Relaterat" section in RadarChart

**Files:**
- Modify: `web/src/app/radar/[slug]/RadarChart.tsx`
- Modify: `web/src/app/radar/[slug]/RadarChart.module.css`
- Modify: `web/src/app/radar/[slug]/RadarChart.test.tsx`

- [ ] **Step 1: Add a failing test**

In `web/src/app/radar/[slug]/RadarChart.test.tsx`, add this test inside the existing `describe("RadarChart", ...)` block (the file already defines `SEGMENTS` and `BLIPS` with a blip `id: "pqc"`):
```typescript
  it("visar Relaterat-länkar för vald blip när relatedByBlip finns", () => {
    const relatedByBlip = {
      pqc: [
        {
          kind: "foresight" as const,
          slug: "digital-suveranitet",
          title: "Digital suveränitet",
          date: "2026-05-29T00:00:00.000Z",
          areaSlugs: ["cyber"],
        },
      ],
    };
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} relatedByBlip={relatedByBlip} />);
    fireEvent.click(screen.getByRole("button", { name: /Post-kvant-kryptografi/ }));

    const link = screen.getByRole("link", { name: /Digital suveränitet/ });
    expect(link.getAttribute("href")).toBe("/foresight/digital-suveranitet");
  });

  it("visar ingen Relaterat-sektion utan relaterade poster", () => {
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Post-kvant-kryptografi/ }));
    expect(screen.queryByText("Relaterat")).toBeNull();
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- "src/app/radar/[slug]/RadarChart.test.tsx"`
Expected: FAIL — `RadarChart` doesn't accept `relatedByBlip` and renders no link.

- [ ] **Step 3: Update the component**

In `web/src/app/radar/[slug]/RadarChart.tsx`:

(a) Add a type-only import after the rings import (line 6):
```typescript
import type { RelatedItem } from "@/lib/radar/related";
```
(`import type` is erased at build, so this does NOT pull server-only code into the client bundle.)

(b) Change the component signature (line 72) to accept the optional prop:
```typescript
export function RadarChart({
  segments,
  blips,
  relatedByBlip,
}: {
  segments: Segment[];
  blips: Blip[];
  relatedByBlip?: Record<string, RelatedItem[]>;
}) {
```

(c) Inside the component, after the `selectedSegment` line (line 79), add:
```typescript
  const related = selected ? relatedByBlip?.[selected.id] ?? [] : [];
```

(d) In the detail panel, add the "Relaterat" block immediately AFTER the implications paragraph (`<p className={styles.dImpact}>{selected.implications}</p>`, line 185) and before the closing `</>`:
```typescript
              {related.length > 0 ? (
                <>
                  <div className={styles.dSub}>Relaterat</div>
                  <ul className={styles.related}>
                    {related.map((item) => (
                      <li key={`${item.kind}-${item.slug}`}>
                        <a
                          className={styles.relatedLink}
                          href={item.kind === "foresight" ? `/foresight/${item.slug}` : `/blogg/${item.slug}`}
                        >
                          <span className={styles.relatedKind}>
                            {item.kind === "foresight" ? "Foresight" : "Blogg"}
                          </span>
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
```

- [ ] **Step 4: Add CSS**

Append to `web/src/app/radar/[slug]/RadarChart.module.css`:
```css
.related {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.relatedLink {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--accent);
  text-decoration: none;
}
.relatedLink:hover {
  text-decoration: underline;
}
.relatedKind {
  flex: none;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold-deep);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- "src/app/radar/[slug]/RadarChart.test.tsx"`
Expected: PASS (all tests, including the original detail-panel test, the 6-segment regression test, and the two new related tests). `npx tsc --noEmit` → no error in the file.

- [ ] **Step 6: Commit**

```bash
git add "src/app/radar/[slug]/RadarChart.tsx" "src/app/radar/[slug]/RadarChart.module.css" "src/app/radar/[slug]/RadarChart.test.tsx"
git commit -m "feat(radar): Relaterat-sektion i blip-panelen"
```

---

## Task 4: Detail page builds relatedByBlip

**Files:**
- Modify: `web/src/app/radar/[slug]/page.tsx`

- [ ] **Step 1: Wire up the related map**

In `web/src/app/radar/[slug]/page.tsx`:

(a) Add an import after the `getRadar` import (line 5):
```typescript
import { getRelatedByBlips } from "@/lib/radar/related";
```

(b) In `RadarDetailPage`, after the `if (!radar) notFound();` line (line 22), add:
```typescript
  const relatedByBlip = await getRelatedByBlips(radar.blips);
```

(c) Pass it to the chart (line 34):
```typescript
        <RadarChart segments={radar.meta.segments} blips={radar.blips} relatedByBlip={relatedByBlip} />
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing `page.tsx`. (`radar.blips` is `Blip[]` which structurally satisfies `getRelatedByBlips`'s `{ id; areaSlugs? }[]` parameter.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/radar/[slug]/page.tsx"
git commit -m "feat(radar): detaljsidan beräknar relatedByBlip och skickar till RadarChart"
```

---

## Task 5: Tag the seed blips with areaSlugs

**Files:**
- Modify: `web/radar/teknikradar-2026.json`

- [ ] **Step 1: Add areaSlugs to each of the 16 blips**

The seed lives at `web/radar/teknikradar-2026.json` (`{ "blips": [ … ] }`). Add an `areaSlugs` array to each blip object using these REAL expertområde slugs (all exist in `web/site-data.json`: `digitalisering`, `cyber`, `revisionsmetodik`, `offentliga-finanser`, `arbetsmarknad`, `miljo-klimat`, `rattsvasende`, `hallbarhet-esg`). Mapping by blip `id`:

| blip id | areaSlugs |
|---|---|
| `frontier-ai-prissattning` | `["digitalisering"]` |
| `agentisk-ai-energi` | `["digitalisering", "miljo-klimat"]` |
| `ai-arbetsmarknad` | `["arbetsmarknad", "digitalisering"]` |
| `statliga-bolag-agentisk-ai` | `["digitalisering"]` |
| `dora-tillsyn` | `["offentliga-finanser", "cyber"]` |
| `stablecoin-cbdc` | `["offentliga-finanser"]` |
| `hyperscaler-beroende-teams` | `["digitalisering", "cyber"]` |
| `pqc-migration` | `["cyber"]` |
| `ai-sarbarhetsupptackt` | `["cyber"]` |
| `agentinfra-angreppsyta` | `["cyber", "digitalisering"]` |
| `eu-compliance-stack` | `["digitalisering", "rattsvasende"]` |
| `svensk-implementeringsaxel` | `["digitalisering", "cyber"]` |
| `oberoende-ai-granskning` | `["revisionsmetodik", "digitalisering"]` |
| `epistemisk-klyfta-revisionsbevis` | `["revisionsmetodik"]` |
| `csrd-csddd-inbromsning` | `["hallbarhet-esg"]` |
| `algoritmrevision-profession` | `["revisionsmetodik"]` |

Add `"areaSlugs": [...]` as a field on each blip object (e.g. after `"implications"`). Keep all other fields unchanged.

- [ ] **Step 2: Validate the seed**

Run from `web/`:
```bash
node -e "const b=require('./radar/teknikradar-2026.json').blips; const s=require('./site-data.json'); const have=new Set(s.expertAreas.map(a=>a.slug)); let n=0; b.forEach(x=>{ if(!Array.isArray(x.areaSlugs)||!x.areaSlugs.length) throw new Error('saknar areaSlugs: '+x.id); x.areaSlugs.forEach(a=>{ if(!have.has(a)) throw new Error('okänt område '+a+' på '+x.id); }); n++; }); console.log('OK', n, 'blips taggade');"
```
Expected: `OK 16 blips taggade`.

Also run the radar store/schema tests to confirm the tagged seed still parses if loaded:
```bash
npm run test -- src/lib/radar
```
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add radar/teknikradar-2026.json
git commit -m "feat(radar): tagga de 16 seed-blipsen med expertområden"
```

---

## Task 6: Document blip areaSlugs in the radar skill

**Files:**
- Modify: `paperclip/skills/local/expertbyran-radar/SKILL.md`

- [ ] **Step 1: Add areaSlugs to the blip field table**

In `paperclip/skills/local/expertbyran-radar/SKILL.md`, find the "Signal → blip: hur varje fält fylls i" table (rows for `name`/`segmentId`/`ring`/`description`/`implications`). Add a final row:
```markdown
| `areaSlugs` | Expertområden (slugs) blippen rör — mappa vaultets `domain/topic` → närmaste expertområde (slå upp via `GET /api/v1/areas`). Styr vilket relaterat innehåll (foresights/bloggar) som visas i blip-panelen. |
```

- [ ] **Step 2: Add a short explanatory note**

Immediately after that table (after the existing "Ringen är en bedömning…" paragraph), add:
```markdown
**Relaterat innehåll:** blippens `areaSlugs` är tema-nyckeln. Radarpanelen visar
automatiskt foresights och blogginlägg som delar minst ett expertområde med blippen — så
tagga blippen med samma områden som relevanta foresights/bloggar för att koppla ihop dem.
```

- [ ] **Step 3: Sanity check**

Confirm the frontmatter still parses (unchanged), the new row matches the table's column count, and no file-path cross-links were introduced (references to other skills stay by name).

- [ ] **Step 4: Commit**

```bash
git add paperclip/skills/local/expertbyran-radar/SKILL.md
git commit -m "docs(skills): expertbyran-radar — areaSlugs på blips + relaterat-koppling"
```

---

## Task 7: Verification + live smoke

**Files:** none (verification only)

- [ ] **Step 1: Clean stale artifact + full suite**

Run: `rm -rf /Users/mattias/source/expertbyran/web/.next` then (from `web/`) `npm run test`
Expected: all pass, including the new schema, related, and RadarChart tests.

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no errors; build succeeds; `/radar/[slug]` still builds.

- [ ] **Step 3: Live smoke (server on :3000 with the foresights already published)**

A dev server is running on `http://localhost:3000` (DATA_DIR=data) with the two foresights already published and the radar present. Update the live radar so its blips carry `areaSlugs`, then confirm the related data reaches the page:
```bash
# from web/ — re-publish the radar (now with areaSlugs) via PUT
node -e "const fs=require('fs'); const meta=require('./radar-data.json').radars[0]; const blips=require('./radar/teknikradar-2026.json').blips; const body=JSON.stringify({meta,blips}); const {execSync}=require('child_process'); execSync(\`curl -s -o /dev/null -w '%{http_code}\\n' -X PUT http://localhost:3000/api/v1/radars/teknikradar-2026 -H 'Authorization: Bearer 4251' -H 'Content-Type: application/json' --data-binary '\`+body.replace(/'/g,\"'\\\\''\")+\`'\`,{stdio:'inherit'});"
```
Expected: HTTP `200`.

Then verify the related data is wired into the detail page (the "Relaterat" links render client-side on click, but the serialized props are in the RSC payload):
```bash
curl -s http://localhost:3000/radar/teknikradar-2026 | grep -c "digital-suveranitet-statsforvaltning-2026-2030"
```
Expected: ≥ 1 (a foresight slug appears in the page's serialized `relatedByBlip` prop — e.g. for the `pqc-migration` blip tagged `cyber`, matching the `digital-suveranitet` foresight tagged `cyber`).

Also confirm the API round-trips areaSlugs:
```bash
curl -s http://localhost:3000/api/v1/radars/teknikradar-2026 | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const b=JSON.parse(d).blips;console.log('blips med areaSlugs:', b.filter(x=>x.areaSlugs&&x.areaSlugs.length).length+'/'+b.length);})"
```
Expected: `blips med areaSlugs: 16/16`.

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "test(radar): verifiering etapp 2 — relaterat innehåll"
```

---

## Notes for the implementer

- `RadarChart` is a client component. Only `import type { RelatedItem }` from `related.ts` (type-only, erased) — never a value import, which would drag the server-only archive/cache code into the client bundle.
- `getRelatedByArea` is the pure, unit-tested core; `getRelatedPool`/`getRelatedByBlips` are the server glue (verified via the page + live smoke, not a fragile store-wiring unit test).
- Related links use plain `<a href>` (full navigation is fine for internal links) — no `next/link` typed-route friction.
- Seed area slugs MUST exist in `web/site-data.json`; the mapping in Task 5 uses only verified slugs.
- This is Etapp 2 — the foresight content type (Etapp 1) is already built; do not re-create it.
- Run tests with `npm run test` from `web/` (never global `npx vitest`).
