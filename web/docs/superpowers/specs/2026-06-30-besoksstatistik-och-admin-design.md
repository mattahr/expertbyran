# Design: Besöksstatistik & adminpanel för web

**Datum:** 2026-06-30
**Projekt:** `web/` (Next.js 16, SQLite via `node:sqlite`)
**Status:** Godkänd design — redo för implementationsplan

## 1. Bakgrund & mål

Webbplatsen har idag ett rudimentärt besöksloggssystem: en klient-beacon (`VisitLogger`) som POST:ar till `/api/v1/log`, vilket appenderar JSONL-filer i `${DATA_DIR}/visits/`, samt en **publik, oautentiserad** `/log`-sida med enkel aggregering. Det saknar landsuppslag, riktig autentisering och ligger inte i SQLite som resten av appen.

Vi bygger ett **självförsörjande besöksstatistik- och administrationssystem**:

* Se besökare per **land, IP, tid, sida**, plus webbläsare, OS, enhet, trafikkälla, skärmupplösning, tidszon och UTM-kampanjer.
* Typisk webbanalys: vilka blogginlägg/sidor som besöks, trender över tid, unika besökare.
* **Ingen extern tjänst** — geo-uppslag sker offline mot en buntad databas.
* Åtkomst bakom **inloggning på `/admin`**, som även rymmer enklare innehållsadministration (radera/redigera blogginlägg, metadata).
* **API:t gör allt utom presentationen** — all aggregering sker i SQL/API-lagret; adminsidorna är tunna och ritar färdiga siffror.

### Icke-mål (medvetet bortvalt, YAGNI)

* Sessioner, bounce rate, vistelsetid (kräver mer klient-instrumentering).
* Flera admin-användare / roller.
* Automatisk gallring av rådata (användaren valde uttryckligt ingen gallring).
* A/B-test, mål-/konverteringsspårning.

## 2. Beslut (fastställda med användaren)

| Område | Beslut |
|---|---|
| Admin-auth | Ett admin-konto; användarnamn + lösenord från env; verifieras server-side; signerad HttpOnly-sessionscookie. |
| Geo-källa | Buntad **DB-IP IP-to-Country Lite** (MMDB), offline-uppslag via rent JS-bibliotek. Proxy-header (t.ex. `cf-ipcountry`) som snabbväg. |
| IP-lagring | Full IP, **ingen** gallring. |
| Scope | Allt i en omgång: login + statistik-dashboard + innehållsadministration. |

## 3. Arkitekturöversikt

```
Besökare ─▶ VisitLogger (beacon, klient)
              │  skickar: path, referrer, lang, languages, timezone,
              │           screen{w,h}, viewport{w,h}, dpr, utm{source,medium,campaign}
              ▼
        POST /api/v1/track (publik, Node-runtime)
              │  server härleder (auktoritativt):
              │   - ts, day, hour (Europe/Stockholm)
              │   - ip (x-forwarded-for / x-real-ip)
              │   - country + country_name (proxy-header ▸ MMDB ▸ null)
              │   - ua_raw (header), browser(+version), os(+version), device(+brand/model), is_bot
              │     berikad av Client Hints (sec-ch-ua*) när de finns
              │   - source + referrer_host (klassning), visitor_id = sha256(salt+ip+ua)
              ▼
        AnalyticsStore.record() ─▶ SQLite-tabell `visits`

Admin ─▶ /admin/* (RSC, cookie-gate i admin-layout)
              ├─ fetch /api/v1/admin/stats/overview   (cookie-auth, all aggregering i SQL)
              ├─ fetch /api/v1/admin/stats/visits      (cookie-auth, paginerad rålista)
              └─ fetch /api/v1/blog/posts/*            (befintliga; nu cookie- ELLER bearer-auth)
```

Allt följer befintliga mönster: storage-abstraktion (`getXStore()`), SQLite-migreringar, Zod-validering, Vitest-kontraktstester.

## 4. Datamodell

### 4.1 Ny migrering (version 2)

**Tabell `visits`:**

| Kolumn | Typ | Not |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `ts` | INTEGER NOT NULL | epoch ms (UTC) |
| `day` | TEXT NOT NULL | `YYYY-MM-DD` i Europe/Stockholm |
| `hour` | INTEGER NOT NULL | 0–23 i Europe/Stockholm |
| `path` | TEXT NOT NULL | |
| `referrer_full` | TEXT | rå referrer |
| `referrer_host` | TEXT | host eller NULL |
| `source` | TEXT NOT NULL | `direct`/`internal`/`search`/`social`/`referral` |
| `utm_source` | TEXT | |
| `utm_medium` | TEXT | |
| `utm_campaign` | TEXT | |
| `country` | TEXT | ISO-3166-1 alpha-2 eller NULL |
| `country_name` | TEXT | svenskt namn eller NULL |
| `ip` | TEXT NOT NULL | full IP (kan vara `""` om okänd) |
| `visitor_id` | TEXT NOT NULL | `sha256(salt + ip + ua_raw)` |
| `ua_raw` | TEXT | |
| `browser` | TEXT | familj, t.ex. `Chrome` |
| `browser_version` | TEXT | major eller major.minor |
| `os` | TEXT | familj, t.ex. `Windows` |
| `os_version` | TEXT | |
| `device` | TEXT | `desktop`/`mobile`/`tablet`/`bot`/`other` |
| `device_brand` | TEXT | när UA exponerar (mobil) |
| `device_model` | TEXT | när UA exponerar (mobil) |
| `is_bot` | INTEGER NOT NULL DEFAULT 0 | |
| `lang` | TEXT | primärt språk |
| `languages` | TEXT | full lista, komma-separerad |
| `timezone` | TEXT | klientens IANA-tidszon |
| `screen_w` / `screen_h` | INTEGER | |
| `viewport_w` / `viewport_h` | INTEGER | |
| `dpr` | REAL | devicePixelRatio |

Index: `idx_visits_ts(ts)`, `idx_visits_day(day)`, `idx_visits_path(path)`, `idx_visits_country(country)`, `idx_visits_visitor(visitor_id)`, `idx_visits_is_bot(is_bot)`.

**Tabell `settings`** (key/value, för persisterade hemligheter):

| Kolumn | Typ |
|---|---|
| `key` | TEXT PRIMARY KEY |
| `value` | TEXT NOT NULL |

Används för `session_secret` och `visitor_salt` — genereras med `crypto.randomBytes(32)` vid första behov och persisteras (om motsvarande env inte är satt).

### 4.2 Ny store: `AnalyticsStore`

Läggs i storage-abstraktionen (`src/lib/stores/types.ts` + composition root `index.ts` + `getAnalyticsStore()`), med SQLite- och in-memory-implementation samt delat kontraktstest (`store-contract.ts`-mönstret).

```ts
interface AnalyticsStore {
  record(visit: VisitInsert): void;                       // synkron insert
  overview(opts: StatsRange): OverviewResult;             // all aggregering
  listVisits(opts: VisitQuery): { total: number; rows: VisitRow[] };
  earliestDay(): string | null;                           // för "Allt"-intervall
}
```

`SettingsStore` (eller enklare modul `src/lib/settings.ts`) hanterar key/value.

## 5. Datainsamling (ingest)

### 5.1 Klient-beacon (`VisitLogger`)

Behåller beacon-mönstret men låter **servern vara auktoritativ** för allt känsligt. Klienten skickar endast lättfångad kontext:

```jsonc
{
  "path": "/blogg/nagot",
  "referrer": "https://google.com/",      // document.referrer
  "lang": "sv-SE",                         // navigator.language
  "languages": ["sv-SE", "en"],            // navigator.languages
  "timezone": "Europe/Stockholm",          // Intl…resolvedOptions().timeZone
  "screen": { "w": 2560, "h": 1440 },
  "viewport": { "w": 1280, "h": 900 },
  "dpr": 2,
  "utm": { "source": "...", "medium": "...", "campaign": "..." }  // från location.search
}
```

* Loggar inte `/admin*` eller `/log`.
* Payload valideras med Zod på servern; ogiltig payload → 400 (ingen rad).
* `sendBeacon` om tillgängligt (överlever sidbyte), annars `fetch keepalive`.

### 5.2 Server-berikning (`POST /api/v1/track`, Node-runtime)

Servern härleder och fyller i:

* **ts/day/hour** — server-tid; `day`/`hour` i `Europe/Stockholm` via `Intl.DateTimeFormat`.
* **ip** — `x-forwarded-for` (första hoppet) ▸ `x-real-ip` ▸ `""`.
* **country/country_name** — `src/lib/geo` (se §6).
* **UA** — `ua_raw` från `user-agent`-header (ej klient); parsas av `src/lib/ua` (se §7); berikas av Client Hints-headers (`sec-ch-ua`, `sec-ch-ua-platform`, `sec-ch-ua-platform-version`, `sec-ch-ua-mobile`) när de finns.
* **source/referrer_host** — `src/lib/analytics/referrer.ts` klassar referrer mot egen host + sök-/sociala-domänlistor.
* **visitor_id** — `sha256(salt + ip + ua_raw)` (stabilt salt ⇒ unika besökare över valfri period, cookiefritt).

Svar: `204 No Content`. Fel sväljs tyst (beacon ska aldrig störa besökaren) men loggas server-side.

### 5.3 Legacy-import

Vid boot (i `bootstrap.ts`, efter migreringar): om `${DATA_DIR}/visits/*.jsonl` finns, importera raderna till `visits` (best-effort: härleda fält som går, lämna geo/enrichment tomt eller köra parsern på lagrad UA), döp sen om filerna till `*.imported`. Följer befintligt legacy-import-mönster. Nödventil: `SKIP_LEGACY_IMPORT=1` (återanvänds).

Därefter tas det gamla systemet bort: `src/lib/storage/visit-log.ts`, `src/app/api/v1/log/route.ts`, `src/app/log/` (sida + css).

## 6. Geo (självförsörjande)

`src/lib/geo/index.ts`:

* Laddar buntad MMDB (`maxmind`/`mmdb-lib`, rent JS) **lazy** och cachar Reader (process-singleton). Förvärms i `bootstrap.ts`.
* `lookupCountry(ip): { country: string; countryName: string } | null` — IPv4 + IPv6; privata/ogiltiga IP ⇒ null.
* **Snabbväg:** giltig ISO2 i `cf-ipcountry`/`x-vercel-ip-country`/`x-geo-country` används före MMDB.
* ISO2 ▸ svenskt landsnamn via egen kompakt tabell `src/lib/geo/country-names.sv.ts`.

**DB-fil:** `web/geoip/dbip-country-lite.mmdb`, committad så imagen är självförsörjande. Sökväg överstyrs av `GEOIP_DB`. `scripts/update-geoip.mjs` hämtar/uppdaterar senaste månadsfilen från db-ip.com och dekomprimerar. Dockerfile kopierar `geoip/`-katalogen in i imagen.

**Attribuering:** DB-IP Lite är CC BY 4.0 ⇒ attribuering krävs. Läggs i admin-statistikens footer ("IP-geodata: DB-IP, CC BY 4.0, db-ip.com") samt i en `NOTICE`-fil i `web/`.

## 7. UA-parsning & enrichment

`src/lib/ua/parse.ts` — dependensfri klassificerare (regex) som returnerar:

```ts
interface UaInfo {
  browser: string; browserVersion: string;
  os: string; osVersion: string;
  device: "desktop" | "mobile" | "tablet" | "bot" | "other";
  deviceBrand?: string; deviceModel?: string;
  isBot: boolean;
}
```

Täcker vanliga webbläsare (Chrome, Edge, Firefox, Safari, Opera, Samsung Internet), OS (Windows, macOS, iOS, Android, Linux, ChromeOS) och en bot-signaturlista (googlebot, bingbot, generiska `bot|crawler|spider|headless|curl|wget` m.fl.). Client Hints överstyr/kompletterar när de finns. Enhetsklass härleds från `mobile`/`tablet`-signaler.

`src/lib/analytics/referrer.ts` — `classify(referrer, ownHost)` ⇒ `{ source, host }` mot små sök-/social-domänlistor (google, bing, duckduckgo, …; facebook, x/twitter, linkedin, reddit, …). Tom referrer ⇒ `direct`; egen host ⇒ `internal`.

## 8. Autentisering & admin-gate

### 8.1 Sessionscookie

`src/lib/admin/session.ts`:

* Token: `v1.<base64url(payload)>.<base64url(hmac)>`, payload `{ sub: "admin", iat, exp }`.
* HMAC-SHA256 (`node:crypto`) över `v1.<payload>` med hemlighet; verifiering med `timingSafeEqual` + exp-kontroll.
* Hemlighet: `ADMIN_SESSION_SECRET` ▸ annars `settings.session_secret` (genereras + persisteras).
* Cookie `eb_admin`: HttpOnly, `SameSite=Lax`, `Secure` i produktion, `Path=/`, `Max-Age` = `SESSION_TTL_DAYS` (default 7).

### 8.2 Login

`src/lib/admin/auth.ts` + `POST /api/v1/admin/login`:

* Body `{ username, password }` (Zod). Jämförs mot `ADMIN_USERNAME` (default `admin`) + `ADMIN_PASSWORD` med `timingSafeEqual` på SHA-256-digests (undviker längd-läckage).
* Om `ADMIN_PASSWORD` saknas: admin avstängd ⇒ 503 med tydligt meddelande.
* Enkel **rate limit** (in-memory, per IP, fast fönster t.ex. 10 försök / 15 min) ⇒ 429.
* Lyckat: sätter `eb_admin`-cookie, svarar 200.

`POST /api/v1/admin/logout` ⇒ rensar cookie. `GET /api/v1/admin/session` ⇒ `{ authenticated: boolean }`.

### 8.3 Gate

* **RSC:** `admin/layout.tsx` läser `eb_admin` via `cookies()`, verifierar; ogiltig ⇒ `redirect("/admin/login")`. `/admin/login` ligger utanför gaten.
* **API:** alla `/api/v1/admin/*` kräver giltig session ⇒ annars 401.
* **Befintliga innehålls-API:er:** `requireAuth` ersätts/kompletteras av `requireAdmin(req)` som accepterar **bearer-token (maskin) ELLER giltig session-cookie**. Vid cookie-auth görs **Origin-check** (`Origin`-header måste matcha egen host) som CSRF-skydd; bearer-vägen kräver ingen Origin-check. Tillämpas på muterande metoder i `blog/posts`, `experts`, `areas`, `foresights`, `radars`, `rerender`.

## 9. Statistik-API

Allt under `/api/v1/admin/stats/*`, cookie-auth, all aggregering i SQL.

### 9.1 `GET /api/v1/admin/stats/overview`

Query: `from` (YYYY-MM-DD), `to` (YYYY-MM-DD), `excludeBots` (default `true`). Svar:

```jsonc
{
  "range": { "from": "...", "to": "...", "excludeBots": true },
  "summary": { "pageviews": 0, "visitors": 0, "days": 0, "avgPerDay": 0, "botPageviews": 0 },
  "timeseries": [{ "day": "...", "pageviews": 0, "visitors": 0 }],
  "topPages":       [{ "path": "...",  "pageviews": 0, "visitors": 0 }],
  "topCountries":   [{ "country": "SE", "countryName": "Sverige", "pageviews": 0, "visitors": 0 }],
  "topReferrers":   [{ "host": "...",  "pageviews": 0 }],
  "topSources":     [{ "source": "...", "pageviews": 0 }],
  "topBrowsers":    [{ "browser": "...", "pageviews": 0 }],
  "topOs":          [{ "os": "...", "pageviews": 0 }],
  "topDevices":     [{ "device": "...", "pageviews": 0 }],
  "topResolutions": [{ "resolution": "1920x1080", "pageviews": 0 }],
  "topTimezones":   [{ "timezone": "...", "pageviews": 0 }],
  "topCampaigns":   [{ "campaign": "...", "source": "...", "medium": "...", "pageviews": 0 }]
}
```

Topplistor begränsas (t.ex. topp 15). Unika räknas som `COUNT(DISTINCT visitor_id)`.

### 9.2 `GET /api/v1/admin/stats/visits`

Query: `from`, `to`, `page` (1-baserad), `pageSize` (default 50, tak 200), samt filter `path`, `country`, `source`, `device`, `excludeBots`, `q` (fritext mot ip/path/ua). Svar:

```jsonc
{
  "total": 0, "page": 1, "pageSize": 50,
  "rows": [{ "ts": 0, "ip": "...", "path": "...", "country": "SE", "countryName": "Sverige",
             "browser": "...", "os": "...", "device": "...", "referrerHost": "...",
             "source": "...", "isBot": false }]
}
```

## 10. Adminpanel (presentation)

* `SiteChrome` + `VisitLogger` gör **passthrough** för `/admin*` (ingen publik nav/footer/loggning). Admin får eget skal via `src/app/admin/layout.tsx` (nav: Översikt, Statistik, Blogg; utloggningsknapp). `noindex` via metadata + befintlig x-robots-policy.
* `src/app/admin/login/page.tsx` — klientformulär ⇒ `POST /api/v1/admin/login` ⇒ redirect till `/admin`.
* `src/app/admin/page.tsx` — översikt (nyckeltal senaste 30 dagar, snabblänkar).
* `src/app/admin/statistik/page.tsx` — dashboard: datumintervall (Idag / 7 / 30 / 90 / Allt / eget), bot-toggle, dependensfria **SVG/CSS-diagram** (yt-/linjediagram för tidsserie, horisontella staplar för topplistor), samt paginerad/filtrerbar besökstabell (tid, IP, sida, land, webbläsare, OS, enhet, källa). Hämtar från stats-API:t (klient-fetch).
* `src/app/admin/blogg/page.tsx` — lista blogginlägg ⇒ redigera metadata / radera via befintliga `PUT`/`DELETE /api/v1/blog/posts/[slug]` (cookie-auth, samma origin).
* CSS-moduler i admin-mappen; återanvänder designspråk där rimligt.

## 11. Nya miljövariabler

| Variabel | Beskrivning | Default |
|---|---|---|
| `ADMIN_USERNAME` | Admin-användarnamn | `admin` |
| `ADMIN_PASSWORD` | Admin-lösenord. **Krävs** för att aktivera admin. | – |
| `ADMIN_SESSION_SECRET` | HMAC-hemlighet för sessionscookie | genereras + persisteras |
| `SESSION_TTL_DAYS` | Sessionslängd i dagar | `7` |
| `GEOIP_DB` | Sökväg till MMDB-fil | buntad `geoip/dbip-country-lite.mmdb` |

Dokumenteras i `web/CLAUDE.md`, `web/API.md`, `.env.example`, `docker-compose.yml`.

## 12. Säkerhet & GDPR

* Full IP lagras utan gallring — **uttryckligt val**. Dokumenteras i `web/CLAUDE.md` (personuppgift; den som driftar ansvarar för rättslig grund/integritetspolicy).
* Cookiefri besökaridentifiering (hash) ⇒ ingen spårningscookie ⇒ ingen samtyckesbanner krävs för analysen i sig.
* Sessionscookie HttpOnly + Secure + SameSite=Lax; HMAC-signerad; timing-safe verifiering.
* Login: timing-safe credential-jämförelse + rate limit.
* CSRF: cookie-auth-mutationer kräver matchande `Origin`.
* `/admin` och `/api/v1/admin/*` `noindex` / utanför robots.

## 13. Tester (Vitest)

* `ua/parse.test.ts` — kända UA-strängar ⇒ rätt browser/os/device/bot.
* `analytics/referrer.test.ts` — direct/internal/search/social/referral.
* `geo/*.test.ts` — uppslag mot liten fixture-MMDB + header-snabbväg + privat-IP ⇒ null.
* `admin/session.test.ts` — sign/verify, exp, manipulerad token avvisas.
* `admin/auth.test.ts` — rätt/fel credential, saknat lösenord ⇒ 503, rate limit ⇒ 429.
* `analytics`-store: delat kontraktstest (memory + sqlite) för `record`/`overview`/`listVisits`; aggregering, unika, bot-exkludering, paginering/filter, datumgränser.
* `api/v1/track` — härleder ip/ua/geo, exkluderar `/admin`, validerar payload.
* CSRF/Origin-test på en muterande endpoint (cookie utan matchande Origin ⇒ avvisas; bearer ⇒ tillåts).
* Render-smoke för `/admin/login` och `/admin/statistik` (tom data ⇒ inga krascher).

## 14. Filöversikt

**Nya:**
`src/lib/geo/index.ts`, `src/lib/geo/country-names.sv.ts`, `src/lib/ua/parse.ts`, `src/lib/analytics/referrer.ts`, `src/lib/admin/session.ts`, `src/lib/admin/auth.ts`, `src/lib/settings.ts`, `src/lib/stores/sqlite-analytics-store.ts`, analytics i `memory-stores.ts`, `src/app/api/v1/track/route.ts`, `src/app/api/v1/admin/login/route.ts`, `…/logout/route.ts`, `…/session/route.ts`, `…/stats/overview/route.ts`, `…/stats/visits/route.ts`, `src/app/admin/layout.tsx`, `…/page.tsx`, `…/login/page.tsx`, `…/statistik/page.tsx`, `…/blogg/page.tsx` (+ CSS-moduler + klientkomponenter för diagram/tabell/datumväljare), `geoip/dbip-country-lite.mmdb`, `scripts/update-geoip.mjs`, `NOTICE`, tester.

**Ändrade:**
`src/lib/db/migrations.ts` (v2), `src/lib/stores/types.ts` + `index.ts`, `src/lib/db/bootstrap.ts` (geo-förvärm + legacy-import), `src/lib/api/auth.ts` (`requireAdmin` + Origin-check), muterande innehålls-routes, `src/components/site/VisitLogger.tsx` + `SiteChrome.tsx` (admin-passthrough), `proxy.ts` (ev. `Accept-CH`-header), `package.json`, `Dockerfile`, `web/CLAUDE.md`, `web/API.md`, `.env.example`, `docker-compose.yml`.

**Borttagna:**
`src/lib/storage/visit-log.ts`, `src/app/api/v1/log/route.ts`, `src/app/log/` (efter legacy-import).

## 15. Öppna risker

* **Beacon undercounting** — JS-lösa besökare/bottar räknas inte (medvetet; standard för self-hosted analytics).
* **IP bakom proxy** — kräver korrekt `x-forwarded-for`; dokumenteras (lita endast på trusted proxy i drift).
* **DB-IP-uppdatering** — geo-DB åldras; `update-geoip.mjs` körs manuellt vid behov.
* **`maxmind`/`mmdb-lib` npm-beroende** — kräver nätåtkomst vid install; om otillgängligt vendoras en minimal MMDB-läsare.
* **node:sqlite synkront** — aggregeringsfrågor på `visits` blockerar event-loopen; hålls indexerade och tidsbudgeteras vid behov (jfr `client.ts`-noten).
