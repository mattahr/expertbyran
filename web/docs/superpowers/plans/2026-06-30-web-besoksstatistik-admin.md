# Besöksstatistik & adminpanel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg ett självförsörjande besöksstatistik- och administrationssystem i `web/`: server-berikad besöksloggning till SQLite, offline geo-uppslag, och en lösenordsskyddad `/admin`-panel med statistik-dashboard och blogg-administration.

**Architecture:** Klient-beacon → `POST /api/v1/track` (server berikar IP/geo/UA/källa) → `AnalyticsStore` (SQLite). Admin bakom HMAC-signerad sessionscookie; all aggregering i SQL via `/api/v1/admin/stats/*`; adminsidor är tunna presentationslager. Följer befintliga mönster (storage-abstraktion, migreringar, Zod, Vitest-kontraktstester).

**Tech Stack:** Next.js 16 (App Router, TS), `node:sqlite`, `maxmind` (MMDB-läsare), DB-IP Country Lite, Zod, Vitest, `node:crypto`.

**Spec:** `web/docs/superpowers/specs/2026-06-30-besoksstatistik-och-admin-design.md`

## Global Constraints

- Svenska med korrekta å/ä/ö i all UI-text, kommentarer, commit-meddelanden, docs.
- Mutationer går via API; data valideras med Zod vid läsning och skrivning.
- Storage-abstraktion: konsumenter rör aldrig DB direkt; nya stores nås via `getXStore()`.
- `node:sqlite` är synkront — håll frågor indexerade.
- Alla nya API-routes: `export const dynamic = "force-dynamic";`
- Tidszon för `day`/`hour`-aggregering: `Europe/Stockholm`.
- Geo-DB committas (`web/geoip/dbip-country-lite.mmdb`, 8.25 MB); attribuering krävs (CC BY 4.0).
- Inga nya runtime-tjänster utöver `maxmind` (rent JS).
- Arbeta på gren `feat/web-besoksstatistik-admin`; commit per task.

---

## Phase 0 — Beroenden & assets

### Task 1: Geo-beroende, DB-asset och uppdateringsskript

**Files:**
- Modify: `web/package.json` (dep `maxmind` ^5.0.6 — redan installerad)
- Asset: `web/geoip/dbip-country-lite.mmdb` (committas), `web/geoip/.gitattributes` (markera binär)
- Create: `web/scripts/update-geoip.mjs`
- Create: `web/NOTICE`
- Modify: `web/.dockerignore`, `web/.gitignore` (säkerställ att `geoip/*.mmdb` INTE ignoreras, men `geoip/*.gz` ignoreras)

- [ ] **Step 1:** Bekräfta `maxmind` i `package.json` dependencies (redan installerad i denna session). Om den saknas: `cd web && npm install maxmind@^5.0.6`.
- [ ] **Step 2:** Bekräfta `web/geoip/dbip-country-lite.mmdb` finns (nedladdad). Lägg `web/geoip/.gitattributes` med `*.mmdb binary`.
- [ ] **Step 3:** Skapa `web/scripts/update-geoip.mjs` — hämtar senaste månadens fil, dekomprimerar, ersätter:

```js
// web/scripts/update-geoip.mjs
// Uppdaterar den buntade DB-IP Country Lite-databasen. Körs manuellt vid behov:
//   node scripts/update-geoip.mjs
import { createWriteStream } from "node:fs";
import { rename, rm } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const OUT = path.join(import.meta.dirname, "..", "geoip", "dbip-country-lite.mmdb");

function monthCandidates() {
  // DB-IP namnger filer per månad: dbip-country-lite-YYYY-MM.mmdb.gz.
  // Prova innevarande och föregående månad (innevarande kan saknas tidigt).
  const now = new Date();
  const out = [];
  for (let back = 0; back < 3; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

for (const m of monthCandidates()) {
  const url = `https://download.db-ip.com/free/dbip-country-lite-${m}.mmdb.gz`;
  const res = await fetch(url);
  if (!res.ok) { console.log(`hoppar ${m} (${res.status})`); continue; }
  const tmp = `${OUT}.tmp`;
  await pipeline(res.body, createGunzip(), createWriteStream(tmp));
  await rename(tmp, OUT);
  console.log(`uppdaterade ${OUT} från ${m}`);
  process.exit(0);
}
console.error("kunde inte hämta någon DB-IP-fil"); process.exit(1);
```

- [ ] **Step 4:** Skapa `web/NOTICE`:

```
Detta verk inkluderar IP-till-land-data från DB-IP.com,
licensierad under Creative Commons Attribution 4.0 International (CC BY 4.0).
https://db-ip.com/ — https://creativecommons.org/licenses/by/4.0/
```

- [ ] **Step 5:** Säkerställ i `web/.dockerignore` att `geoip/` INTE ignoreras (lägg ev. rad `!geoip`). Lägg i `web/.gitignore`: `geoip/*.gz` och `geoip/*.tmp`.
- [ ] **Step 6 (verifiera):** `cd web && node -e "const m=require('maxmind'); m.open('geoip/dbip-country-lite.mmdb').then(r=>console.log(r.get('193.13.0.1').country.iso_code))"` → `SE`.
- [ ] **Step 7 (commit):** `chore(web): bunta DB-IP geo-databas + maxmind + uppdateringsskript`

---

## Phase 1 — Rena moduler (oberoende, TDD)

### Task 2: UA-parser

**Files:**
- Create: `web/src/lib/ua/parse.ts`, `web/src/lib/ua/parse.test.ts`

**Interfaces — Produces:**
```ts
export interface UaInfo {
  browser: string; browserVersion: string;
  os: string; osVersion: string;
  device: "desktop" | "mobile" | "tablet" | "bot" | "other";
  deviceBrand?: string; deviceModel?: string;
  isBot: boolean;
}
export function parseUserAgent(ua: string | null | undefined): UaInfo;
/** Berikar med Client Hints-headers när de finns (överstyr os/version + mobil-flagga). */
export function applyClientHints(info: UaInfo, hints: {
  platform?: string | null; platformVersion?: string | null; mobile?: string | null;
}): UaInfo;
```

- [ ] **Step 1 (test):** Skriv `parse.test.ts` med kända UA-strängar:
  - Chrome/Win → `{browser:"Chrome", os:"Windows", device:"desktop", isBot:false}`
  - Safari/iPhone → `{browser:"Safari", os:"iOS", device:"mobile"}`
  - Android Chrome surfplatta (UA utan "Mobile") → `device:"tablet"`
  - `Googlebot/2.1` → `{isBot:true, device:"bot"}`; `curl/8.1` → `isBot:true`
  - tom/`null` → `{browser:"Okänd", os:"Okänd", device:"other", isBot:false}`
  - `applyClientHints` med `platform:"Windows", platformVersion:"15.0.0"` → `os:"Windows", osVersion:"11"` (mappa CH-version; minimalt: sätt osVersion till platformVersion-major).
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera `parse.ts` (regex-baserad, dependensfri). Bot-detektion via signaturlista (`bot|crawler|spider|slurp|headless|curl|wget|python-requests|googlebot|bingbot|duckduckbot|...`) FÖRE webbläsar-matchning. Webbläsarordning: Edg → OPR/Opera → SamsungBrowser → Chrome → Firefox → Safari (Safari sist; matcha `Version/x ... Safari`). OS: Windows NT→Windows(+version-map 10.0→"10/11"), `iPhone|iPad`→iOS, Android, `Mac OS X`→macOS, CrOS→ChromeOS, Linux. Enhet: `iPad|Tablet|(Android utan "Mobile")`→tablet; `Mobile|iPhone|Android.*Mobile`→mobile; bot→bot; annars desktop.
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): UA-parser med bot- och enhetsdetektion`

### Task 3: Referrer-klassning

**Files:**
- Create: `web/src/lib/analytics/referrer.ts`, `web/src/lib/analytics/referrer.test.ts`

**Interfaces — Produces:**
```ts
export type TrafficSource = "direct" | "internal" | "search" | "social" | "referral";
export function classifyReferrer(referrer: string | null | undefined, ownHost: string | null):
  { source: TrafficSource; host: string | null };
```

- [ ] **Step 1 (test):** tom→`{source:"direct",host:null}`; `https://www.google.com/…`→`search`; `https://t.co/…`/`facebook.com`/`linkedin.com`→`social`; egen host (`expertbyran.ai`)→`internal`; annan host→`referral`; ogiltig URL→`referral` med host=råsträng.
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera: parsa host via `new URL`; jämför mot SEARCH-set (google, bing, duckduckgo, yahoo, ecosia, baidu, yandex, brave) och SOCIAL-set (facebook, t.co, x, twitter, linkedin, reddit, instagram, youtube, mastodon, bluesky, lnkd.in). `www.`-prefix strippas. Tom→direct; egen host→internal.
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): referrer-klassning (sök/social/intern/hänvisning)`

### Task 4: Geo-modul (offline MMDB + svenska landsnamn)

**Files:**
- Create: `web/src/lib/geo/index.ts`, `web/src/lib/geo/index.test.ts`

**Interfaces — Produces:**
```ts
export async function loadGeo(): Promise<void>;        // förvärm; idempotent
export function isGeoLoaded(): boolean;
export function lookupCountry(ip: string | null | undefined):
  { country: string; countryName: string } | null;     // synkront, kräver loadGeo() först
export function resolveCountry(headerCountry: string | null | undefined, ip: string | null | undefined):
  { country: string; countryName: string } | null;     // proxy-header ▸ MMDB
export function swedishCountryName(iso2: string): string;
export function __setGeoReaderForTest(reader: { get(ip: string): unknown } | null): void;
```

- [ ] **Step 1 (test):** Med `__setGeoReaderForTest` som injicerar en fejk-reader: `lookupCountry("8.8.8.8")`→`{country:"US",countryName:"USA"}`; okänd IP→null; tom IP→null. `resolveCountry("se", "1.2.3.4")`→`{country:"SE",countryName:"Sverige"}` (header-snabbväg, versaliserad, MMDB ej anropad); `resolveCountry("XX", ip)` ignorerar ogiltig header och faller till MMDB. `swedishCountryName("GB")`→"Storbritannien".
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera. `loadGeo` öppnar `maxmind.open(GEOIP_DB ?? cwd/geoip/dbip-country-lite.mmdb)` och cachar Reader i modulvariabel (try/catch → loggar, lämnar null). `lookupCountry` använder cachad reader (eller test-injicerad), `reader.get(ip)`, plockar `country.iso_code`. `swedishCountryName` använder cachad `new Intl.DisplayNames(["sv"],{type:"region"})`, fallback iso2 vid fel/oförändrat. `resolveCountry`: om header matchar `/^[A-Za-z]{2}$/` och ej i `{"XX","T1","ZZ"}` → `{iso, swedishName}`; annars `lookupCountry(ip)`.
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): offline geo-uppslag (DB-IP MMDB) med svenska landsnamn`

### Task 5: Sessionssignering

**Files:**
- Create: `web/src/lib/admin/session.ts`, `web/src/lib/admin/session.test.ts`

**Interfaces — Produces:**
```ts
export function createSessionToken(secret: string, ttlMs: number, now: number): string;
export function verifySessionToken(token: string | undefined, secret: string, now: number): boolean;
```

- [ ] **Step 1 (test):** skapad token verifierar sant vid `now < exp`; falskt vid `now > exp`; manipulerad signatur→falskt; fel hemlighet→falskt; trasig/tom token→falskt; token med annan längd-signatur→falskt (ingen krasch).
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera enligt spec §8.1 (HMAC-SHA256 över `v1.<payload>`, base64url, `timingSafeEqual` med längdkontroll, exp i payload).
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): HMAC-signerade adminsessioner`

---

## Phase 2 — Persistens

### Task 6: Migrering v2 (visits + settings) & settings-modul

**Files:**
- Modify: `web/src/lib/db/migrations.ts` (lägg migration version 2)
- Create: `web/src/lib/settings.ts`, `web/src/lib/settings.test.ts`

**Interfaces — Produces:**
```ts
// settings.ts
export function getSetting(key: string): string | null;
export function setSetting(key: string, value: string): void;
export function getOrCreateSecret(key: string): string;   // 32-byte hex, persisteras
```

- [ ] **Step 1:** Lägg migration `{version:2, name:"besoksstatistik"}` som skapar `visits` (alla kolumner + index från spec §4.1) och `settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)`.
- [ ] **Step 2 (test):** `settings.test.ts` (mot in-memory DB via `__resetDbForTest` + temp DATA_DIR): `getSetting`→null; `setSetting`+`getSetting` round-trip; `getOrCreateSecret` returnerar stabilt värde över anrop (persisteras).
- [ ] **Step 3:** Implementera `settings.ts` mot `getDb()`.
- [ ] **Step 4:** Kör migr- + settings-test → PASS.
- [ ] **Step 5 (commit):** `feat(web): migrering v2 (visits + settings) och settings-modul`

### Task 7: AnalyticsStore (typer, sqlite, memory, kontrakt)

**Files:**
- Modify: `web/src/lib/stores/types.ts` (lägg `AnalyticsStore` + DTO-typer)
- Create: `web/src/lib/stores/sqlite-analytics-store.ts`
- Modify: `web/src/lib/stores/memory-stores.ts` (lägg `InMemoryAnalyticsStore`)
- Modify: `web/src/lib/stores/store-contract.ts` (lägg `analyticsStoreContract`)
- Modify: `web/src/lib/stores/sqlite-stores.test.ts` och `memory-stores.test.ts` (anropa nya kontraktet)
- Modify: `web/src/lib/stores/index.ts` (lägg `getAnalyticsStore()`)

**Interfaces — Produces:**
```ts
export interface VisitInsert {
  ts: number; day: string; hour: number; path: string;
  referrerFull: string | null; referrerHost: string | null; source: string;
  utmSource: string | null; utmMedium: string | null; utmCampaign: string | null;
  country: string | null; countryName: string | null; ip: string; visitorId: string;
  uaRaw: string | null; browser: string | null; browserVersion: string | null;
  os: string | null; osVersion: string | null; device: string;
  deviceBrand: string | null; deviceModel: string | null; isBot: boolean;
  lang: string | null; languages: string | null; timezone: string | null;
  screenW: number | null; screenH: number | null; viewportW: number | null;
  viewportH: number | null; dpr: number | null;
}
export interface StatsRange { from: string; to: string; excludeBots: boolean; limit?: number; }
export interface OverviewResult { /* enligt spec §9.1 */ }
export interface VisitQuery {
  from: string; to: string; page: number; pageSize: number;
  path?: string; country?: string; source?: string; device?: string;
  excludeBots: boolean; q?: string;
}
export interface VisitRow { ts:number; ip:string; path:string; country:string|null;
  countryName:string|null; browser:string|null; os:string|null; device:string;
  referrerHost:string|null; source:string; isBot:boolean; }
export interface AnalyticsStore {
  record(v: VisitInsert): void;
  overview(opts: StatsRange): OverviewResult;
  listVisits(opts: VisitQuery): { total: number; page: number; pageSize: number; rows: VisitRow[] };
  earliestDay(): string | null;
}
```

- [ ] **Step 1 (kontraktstest):** Skriv `analyticsStoreContract(name, makeStore)`:
  - `record` 3 besök (2 dag A samma visitor, 1 dag B annan visitor, + 1 bot) → `overview` (excludeBots:true): `summary.pageviews=3`, `visitors=2`, `days=2`, `botPageviews=1`; `excludeBots:false` → `pageviews=4`.
  - `topPages` rankar mest besökt först; `topCountries` grupperar och räknar unika; `timeseries` har en rad per dag sorterad stigande.
  - `listVisits` paginerar (total korrekt, `pageSize`-gräns), filtrerar på `path`/`country`/`device`/`excludeBots` och `q` (substräng mot ip/path), sorterar nyast först.
  - `earliestDay` returnerar minsta `day`.
- [ ] **Step 2:** Kör mot memory → FAIL.
- [ ] **Step 3:** Implementera `InMemoryAnalyticsStore` (array + JS-aggregering).
- [ ] **Step 4:** Kör memory → PASS.
- [ ] **Step 5:** Implementera `SqliteAnalyticsStore` (prepared statements; aggregering i SQL — `GROUP BY`, `COUNT(*)`, `COUNT(DISTINCT visitor_id)`, `WHERE day BETWEEN ? AND ?` [+ `AND is_bot=0`]; topplistor `ORDER BY pv DESC LIMIT ?`; `listVisits` med dynamiskt byggd WHERE + `LIMIT/OFFSET` och separat `COUNT(*)`).
- [ ] **Step 6:** Koppla `getAnalyticsStore()` i `index.ts` (lägg i `Stores`-typ, defaults `new SqliteAnalyticsStore()`, override-stöd).
- [ ] **Step 7:** Kör sqlite-kontrakt → PASS.
- [ ] **Step 8 (commit):** `feat(web): AnalyticsStore (sqlite + memory) med delat kontraktstest`

---

## Phase 3 — Insamling (ingest)

### Task 8: `POST /api/v1/track` + Zod-schema + berikning

**Files:**
- Create: `web/src/lib/analytics/track-schema.ts` (Zod), `web/src/lib/analytics/build-visit.ts` (ren funktion), `web/src/lib/analytics/build-visit.test.ts`
- Create: `web/src/app/api/v1/track/route.ts`

**Interfaces — Produces:**
```ts
// track-schema.ts
export const trackPayloadSchema: z.ZodType<TrackPayload>;
export type TrackPayload = { path: string; referrer?: string|null; lang?: string|null;
  languages?: string[]|null; timezone?: string|null;
  screen?: {w:number;h:number}|null; viewport?: {w:number;h:number}|null;
  dpr?: number|null; utm?: {source?:string|null;medium?:string|null;campaign?:string|null}|null; };
// build-visit.ts — ren, testbar berikning (ingen I/O utöver injicerade beroenden)
export function buildVisit(input: {
  payload: TrackPayload; now: number; ip: string; uaRaw: string|null;
  clientHints: {platform?:string|null;platformVersion?:string|null;mobile?:string|null};
  headerCountry: string|null; ownHost: string|null; visitorSalt: string;
}): VisitInsert;
```

- [ ] **Step 1 (test):** `build-visit.test.ts`: ger korrekt `day`/`hour` (Europe/Stockholm för känt `now`), `source`/`referrerHost` via klassning, `country` via injicerbar geo (mocka `resolveCountry` eller injicera reader), `visitorId` = sha256(salt+ip+ua) stabil, `isBot` från UA, utm-fält plockas, screen/viewport/dpr mappas.
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera `track-schema.ts` + `buildVisit` (använder `parseUserAgent`+`applyClientHints`, `classifyReferrer`, `resolveCountry`, `crypto` för visitorId; `Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Stockholm",...})` för day/hour).
- [ ] **Step 4:** Implementera route: `POST` läser JSON → validerar med schema (ogiltig→400) → härleder ip (`x-forwarded-for`[0]▸`x-real-ip`▸"") + uaRaw (header) + clientHints (`sec-ch-ua-platform` etc.) + headerCountry (`cf-ipcountry`▸`x-vercel-ip-country`▸`x-geo-country`) + ownHost (`host`-header) + `getVisitorSalt()` → `buildVisit` → `getAnalyticsStore().record()` → 204. All fel sväljs (logga, 204/500). `export const dynamic="force-dynamic"`.
- [ ] **Step 5:** Kör → PASS.
- [ ] **Step 6 (commit):** `feat(web): ingest-endpoint /api/v1/track med server-berikning`

### Task 9: VisitLogger-omskrivning + admin/passthrough

**Files:**
- Modify: `web/src/components/site/VisitLogger.tsx`
- Modify: `web/src/components/site/SiteChrome.tsx` (passthrough för `/admin*`)
- Modify: `web/src/proxy.ts` (lägg `Accept-CH`-svarsheader)

- [ ] **Step 1:** Skriv om `VisitLogger`: bygg payload (path, referrer, lang, languages, timezone, screen, viewport, dpr, utm från `new URLSearchParams(location.search)`); skicka via `navigator.sendBeacon` (Blob `application/json`) med fallback `fetch(..., {keepalive:true})`; hoppa över `pathname.startsWith("/admin")` och `/log`.
- [ ] **Step 2:** `SiteChrome`: läs pathname (via `headers()` `x-pathname` i RSC eller befintlig mekanism); om `/admin*` → returnera `<>{children}</>` utan nav/footer.
- [ ] **Step 3:** `proxy.ts`: `response.headers.set("Accept-CH","Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Mobile")`.
- [ ] **Step 4 (verifiera):** `npm run test` (befintliga SiteChrome/MobileNav-tester gröna).
- [ ] **Step 5 (commit):** `feat(web): server-auktoritativ beacon + admin-passthrough i chrome`

### Task 10: Legacy-import + geo-förvärm i bootstrap; ta bort gamla loggsystemet

**Files:**
- Modify: `web/src/lib/db/bootstrap.ts` (geo-förvärm `loadGeo()`; importera `${DATA_DIR}/visits/*.jsonl`)
- Create: `web/src/lib/db/import-legacy-visits.ts`, `web/src/lib/db/import-legacy-visits.test.ts`
- Delete: `web/src/lib/storage/visit-log.ts`, `web/src/app/api/v1/log/route.ts`, `web/src/app/log/page.tsx`, `web/src/app/log/log.module.css`

- [ ] **Step 1 (test):** `import-legacy-visits.test.ts`: given temp `visits/visits-2026-05-05.jsonl` med 2 rader → importerar 2 `visits` (härleder day/hour/source/ua/geo bäst möjligt), döper om filen till `.imported`; idempotent ( kör två gånger → inga dubbletter eftersom `.jsonl` borta).
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera `import-legacy-visits.ts` (läs JSONL via `readAllVisits`-motsvarighet INNAN borttagning — flytta minimal JSONL-parse hit), `buildVisit`-light från lagrad `{timestamp,path,ip,userAgent,referer,lang}`. Anropa från `bootstrap.ts` efter migreringar, gated av `SKIP_LEGACY_IMPORT`.
- [ ] **Step 4:** Lägg `await loadGeo()` i `bootstrap.ts` (efter DB-ready, före import så importen kan geo-koda).
- [ ] **Step 5:** Ta bort gamla filerna; sök referenser (`grep -rn "visit-log\|/api/v1/log\|app/log" src`) och städa.
- [ ] **Step 6:** Kör `npm run test` + `npx tsc --noEmit` → PASS.
- [ ] **Step 7 (commit):** `refactor(web): migrera besöksloggen till SQLite, ta bort JSONL-systemet`

---

## Phase 4 — Auth & gate

### Task 11: Admin-auth (credentials, rate limit, secret-resolution)

**Files:**
- Create: `web/src/lib/admin/auth.ts`, `web/src/lib/admin/auth.test.ts`
- Create: `web/src/lib/admin/config.ts` (env-läsning: `getSessionSecret()`, `getSessionTtlMs()`, `adminEnabled()`)

**Interfaces — Produces:**
```ts
// auth.ts
export function verifyCredentials(username: string, password: string): boolean;
export function checkRateLimit(ip: string, now: number): boolean;  // true = tillåten
export function resetRateLimitForTest(): void;
// config.ts
export function adminEnabled(): boolean;                // !!ADMIN_PASSWORD
export function getSessionSecret(): string;             // env ▸ getOrCreateSecret
export function getSessionTtlMs(): number;              // SESSION_TTL_DAYS*dag, default 7
export function getVisitorSalt(): string;               // env ▸ getOrCreateSecret
```

- [ ] **Step 1 (test):** rätt user+pass→true; fel→false; saknat `ADMIN_PASSWORD`→`adminEnabled()` false & `verifyCredentials` false; rate limit: >N försök inom fönster→false (`resetRateLimitForTest` mellan tester).
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera (timing-safe via sha256-digests; rate limit `Map<ip,{count,windowStart}>`, t.ex. 10/15 min).
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): admin-credentials, rate limit och secret-resolution`

### Task 12: `requireAdmin` + Origin-check i api/auth

**Files:**
- Modify: `web/src/lib/api/auth.ts` (lägg `requireAdmin`, `assertSameOrigin`, cookie-läsning)
- Create: `web/src/lib/api/auth.test.ts`

**Interfaces — Produces:**
```ts
export type AuthResult = { ok: true; via: "bearer" | "cookie" } | { ok: false };
export function requireAdmin(req: NextRequest): AuthResult;     // bearer ELLER giltig session-cookie
export function assertSameOrigin(req: NextRequest): boolean;    // Origin-host === host
```

- [ ] **Step 1 (test):** giltig bearer→`{ok:true,via:"bearer"}`; giltig `eb_admin`-cookie→`{ok:true,via:"cookie"}`; ingen→`{ok:false}`; `assertSameOrigin` sant när `Origin` matchar `host`, annars falskt; saknad Origin→falskt (för cookie-mutationer).
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera (`requireAuth` kvar för ren bearer; `requireAdmin` läser `authorization` ELLER `req.cookies.get("eb_admin")` + `verifySessionToken(getSessionSecret())`).
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): requireAdmin (bearer eller session) + Origin-CSRF-skydd`

### Task 13: Login/logout/session-routes

**Files:**
- Create: `web/src/app/api/v1/admin/login/route.ts`, `…/logout/route.ts`, `…/session/route.ts`
- Create: `web/src/app/api/v1/admin/login/route.test.ts`

- [ ] **Step 1 (test):** login fel cred→401; saknat ADMIN_PASSWORD→503; rate limit→429; rätt→200 + `Set-Cookie: eb_admin=…; HttpOnly`. session utan cookie→`{authenticated:false}`; med giltig→`{authenticated:true}`. logout→rensar cookie.
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera login (Zod body, `adminEnabled`→503, `checkRateLimit`→429, `verifyCredentials`→401, annars `createSessionToken` + `Set-Cookie` med attribut från config; `Secure` när `NODE_ENV==="production"`). logout: `Set-Cookie: eb_admin=; Max-Age=0`. session: verifiera cookie.
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): admin login/logout/session-endpoints`

---

## Phase 5 — Statistik-API

### Task 14: `/api/v1/admin/stats/overview` + `/visits`

**Files:**
- Create: `web/src/app/api/v1/admin/stats/overview/route.ts`, `…/visits/route.ts`
- Create: `web/src/lib/admin/stats-params.ts` (parsning av from/to/excludeBots/paginering + "Allt"→earliestDay), `web/src/lib/admin/stats-params.test.ts`
- Create: route-tester för båda

- [ ] **Step 1 (test):** `stats-params.test.ts`: default-intervall (30 dagar), klamring av pageSize (≤200), excludeBots default true, ogiltiga datum→fallback. Route-test: utan auth→401; med cookie→200 + form enligt spec §9.
- [ ] **Step 2:** Kör → FAIL.
- [ ] **Step 3:** Implementera parsning + routes (`requireAdmin`→401 annars; `getAnalyticsStore().overview/listVisits`; `force-dynamic`).
- [ ] **Step 4:** Kör → PASS.
- [ ] **Step 5 (commit):** `feat(web): statistik-API (overview + paginerad visits)`

---

## Phase 6 — Innehålls-admin-auth

### Task 15: Växla muterande innehålls-routes till `requireAdmin`

**Files:**
- Modify: `blog/posts/route.ts` + `blog/posts/[slug]/route.ts`, `experts/*`, `areas/*`, `foresights/*`, `radars/*`, `rerender/route.ts`

- [ ] **Step 1:** Ersätt `requireAuth(req)` → `requireAdmin(req)` i POST/PUT/DELETE; vid `via==="cookie"` kräv `assertSameOrigin(req)` (annars 403). Lämna `rerender` på ren bearer om önskat (maskin-flöde) — men tillåt även cookie+origin.
- [ ] **Step 2 (test):** Lägg ett test som bekräftar att en cookie-auth DELETE utan matchande Origin avvisas (403) men med Origin tillåts.
- [ ] **Step 3:** Kör `npm run test` (befintliga route-tester gröna med bearer).
- [ ] **Step 4 (commit):** `feat(web): innehålls-API accepterar adminsession (cookie) med Origin-skydd`

---

## Phase 7 — Adminpanel (UI)

### Task 16: Admin-skal + gate + login-sida

**Files:**
- Create: `web/src/app/admin/layout.tsx` (RSC-gate + skal), `web/src/app/admin/admin.module.css`
- Create: `web/src/app/admin/login/page.tsx` (+ klient-form-komponent), `web/src/app/admin/page.tsx` (översikt)
- Create: `web/src/components/admin/AdminNav.tsx`, `web/src/components/admin/LoginForm.tsx`

- [ ] **Step 1:** `layout.tsx`: läs `eb_admin` via `cookies()`, `verifySessionToken`; om ogiltig och path≠`/admin/login`→`redirect("/admin/login")`. Rendera `AdminNav` + children (utom på login). `metadata.robots = {index:false,follow:false}`.
- [ ] **Step 2:** `LoginForm` (klient): POST `/api/v1/admin/login`; vid 200 `router.push("/admin")`; visa fel (401/429/503).
- [ ] **Step 3:** `admin/page.tsx`: hämta `overview` (senaste 30 dagar) server-side via `getAnalyticsStore()` ELLER klient-fetch; visa nyckeltal + snabblänkar.
- [ ] **Step 4 (test):** render-smoke för `LoginForm` (renderar fält) och `/admin/login` (ingen krasch).
- [ ] **Step 5 (commit):** `feat(web): adminskal, sessionsgate och inloggningssida`

### Task 17: Statistik-dashboard

**Files:**
- Create: `web/src/app/admin/statistik/page.tsx`
- Create: `web/src/components/admin/StatsDashboard.tsx` (klient: datumväljare, bot-toggle, fetch overview),
  `web/src/components/admin/BarList.tsx`, `web/src/components/admin/TimeseriesChart.tsx` (dependensfri SVG),
  `web/src/components/admin/VisitsTable.tsx` (klient: paginering/filter, fetch visits)
- Create: CSS-moduler + render-tester

- [ ] **Step 1:** `StatsDashboard`: state för range/excludeBots; `useEffect`-fetch `/api/v1/admin/stats/overview`; rendera summary-kort, `TimeseriesChart`, och `BarList` per topplista (sidor, länder, källor, referrers, webbläsare, OS, enheter, upplösningar, tidszoner, kampanjer). `VisitsTable` fetchar `/visits` med paginering + filter.
- [ ] **Step 2:** `TimeseriesChart` ritar enkel SVG-yt/linje från `timeseries`. `BarList` horisontella staplar (CSS-bredd ∝ andel).
- [ ] **Step 3 (test):** render-smoke med mockad fetch (tom data → "Ingen data"; med data → staplar/rader).
- [ ] **Step 4:** Footer-attribuering: "IP-geodata: DB-IP (CC BY 4.0)".
- [ ] **Step 5 (commit):** `feat(web): statistik-dashboard med diagram och besökstabell`

### Task 18: Blogg-administration

**Files:**
- Create: `web/src/app/admin/blogg/page.tsx`, `web/src/components/admin/BlogAdmin.tsx` (klient), CSS

- [ ] **Step 1:** `BlogAdmin`: hämta lista (`GET /api/v1/blog/posts`), rendera tabell; per rad: redigera metadata (titel, datum, författare, områden, excerpt) via `PUT /api/v1/blog/posts/[slug]` (cookie, same-origin) och radera via `DELETE` med bekräftelse.
- [ ] **Step 2 (test):** render-smoke (lista renderas; bekräftelsedialog visas före radering).
- [ ] **Step 3 (commit):** `feat(web): blogg-administration (redigera metadata, radera)`

---

## Phase 8 — Config, Docker, docs

### Task 19: Env, Dockerfile, proxy-matcher, docs

**Files:**
- Modify: `web/Dockerfile` (`COPY --from=builder --chown=65532:65532 /app/geoip ./geoip`)
- Modify: `web/.env.example`, `web/docker-compose.yml`
- Modify: `web/CLAUDE.md` (env-tabell, datamodell-avsnitt, GDPR-not), `web/API.md` (nya endpoints)
- Modify: `web/src/proxy.ts` matcher om `/admin` behöver särbehandling (annars oförändrad)

- [ ] **Step 1:** Dockerfile: lägg geoip-COPY i runner-steget. Verifiera `geoip` ej i `.dockerignore`.
- [ ] **Step 2:** `.env.example`/`docker-compose.yml`: dokumentera `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SESSION_TTL_DAYS`, `GEOIP_DB`.
- [ ] **Step 3:** `CLAUDE.md`: nytt avsnitt "Besöksstatistik & admin" (ingest, geo, auth, GDPR-not om full IP utan gallring), uppdatera env-tabell. `API.md`: dokumentera `/api/v1/track`, `/api/v1/admin/*`.
- [ ] **Step 4 (commit):** `docs(web): dokumentera besöksstatistik, admin och nya env-variabler`

---

## Phase 9 — Verifiering

### Task 20: Full verifiering + adversariell granskning

- [ ] **Step 1:** `cd web && npx tsc --noEmit` → inga fel.
- [ ] **Step 2:** `npm run lint` → rent.
- [ ] **Step 3:** `npm run test` → alla gröna.
- [ ] **Step 4:** `npm run build` → standalone-build lyckas.
- [ ] **Step 5 (manuell rök):** `DATA_DIR=data ADMIN_PASSWORD=test npm run dev`; `curl -XPOST :3000/api/v1/track -d '{"path":"/blogg/x"}' -H content-type:application/json` → 204; logga in (`curl -i -XPOST :3000/api/v1/admin/login -d '{"username":"admin","password":"test"}'` → 200 + cookie); `curl --cookie "eb_admin=…" :3000/api/v1/admin/stats/overview` → JSON med pageviews ≥1; besök `/admin` i webbläsare.
- [ ] **Step 6:** Adversariell kod-granskning av hela diffen (säkerhet: auth-bypass, CSRF, SQL-injektion via dynamisk WHERE, IP-spoofing, cookie-attribut; korrekthet: tidszon-aggregering, unika-räkning, paginering).
- [ ] **Step 7 (commit):** ev. fixar från granskningen.

---

## Self-Review (mot spec)

- **Spec §4 datamodell** → Task 6/7. **§5 ingest** → Task 8/9/10. **§6 geo** → Task 1/4. **§7 UA/referrer** → Task 2/3. **§8 auth/gate** → Task 5/11/12/13/16. **§9 stats-API** → Task 14. **§10 UI** → Task 16/17/18. **§11 env** → Task 19. **§12 säkerhet/GDPR** → Task 11–13/15/19/20. **§13 tester** → varje task + Task 20. **§14 filer** → täckta. Inga gap.
- **Typkonsistens:** `VisitInsert`/`OverviewResult`/`VisitRow`/`AuthResult`/`UaInfo`/`TrafficSource` definierade en gång (Task 7/2/3/12) och konsumeras med samma namn.
- **Inga placeholders:** kvarvarande "enligt spec §X" pekar på en konkret, redan skriven specsektion (ej TODO).
