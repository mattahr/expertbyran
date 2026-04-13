# Responsiv omdesign av web/

**Datum:** 2026-04-14
**Scope:** `web/` (Next.js-webbplatsen)
**Syfte:** Göra webben responsiv (särskilt mobil) och ge den ett mer levande, modernt uttryck — utan att förlora den sobra, varma karaktären.

## Bakgrund

Den nuvarande webbplatsen använder vanilla CSS + CSS Modules, har en enda breakpoint vid 768px och saknar hamburger-meny. På iPhone svämmar de 6 menyvalen över så att t.ex. "Blogg" inte syns. Designen är kompetent men uttrycket är för minimalistiskt — användaren vill ha en sober men levande och modern känsla.

Inga tekniska stack-byten. Vi fortsätter med Next.js 16, vanilla CSS + CSS Modules, inga nya dependencies.

## Mål

1. Full responsivitet: mobil (<640px), tablet (640–1024px), desktop (>1024px)
2. Hamburger-meny med slide-in-panel på mobil **och tablet** (konsistens)
3. Utvidgad färgpalett: rust-orange + marin + sparsam guld
4. Subtila scroll-reveal-animationer för "levande" känsla
5. Polish på alla sidtyper (hem, experter, områden, team, blogg, marknadsplats)

**Icke-mål:** Nya funktioner (sök, filter), tekniska stack-byten, CMS-förändringar, data-modellförändringar. `site-data.json` förblir oförändrad.

## Designbeslut

### Färgsystem

Utöka [web/src/app/globals.css](../../../web/src/app/globals.css) med nya tokens:

```css
/* Primär (befintlig) */
--accent: #c26a3f;
--accent-light: rgba(194, 106, 63, 0.08);
--accent-border: rgba(194, 106, 63, 0.25);
--accent-hover: #a85a34;

/* Sekundär — marinblå (inspirerat av Riksrevisionen) */
--marine: #1e3a5f;
--marine-light: rgba(30, 58, 95, 0.08);
--marine-border: rgba(30, 58, 95, 0.25);
--marine-hover: #17304d;

/* Tertiär — guld (sparsam användning) */
--gold: #e8b84a;
--gold-deep: #8a6b1e;
--gold-light: rgba(232, 184, 74, 0.15);
```

**Användningsregler:**

- **Rust** — brand-signatur, eyebrow-etiketter, underline-animationer, primär CTA, accent-border i kort
- **Marin** — sekundär CTA ("Boka möte"), avsnittsbakgrunder för djup, sidebar-bakgrund på detaljsidor
- **Guld** — endast för badges (t.ex. "Nytt", "Rekommenderad") och featured-markering — aldrig för text-accentuering

Ingen semantisk mapping per expertområde (håller det sobert).

### Breakpoints

```css
/* Mobil: default (< 640px) */
@media (min-width: 640px)  { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
@media (min-width: 1280px) { /* large desktop — mer luft */ }
```

Existerande `@media (max-width: 768px)` ersätts överallt med motsvarande mobile-first min-width-queries.

### Typografi

- Behåll `Instrument Serif` (display) + `DM Sans` (body)
- **Basstorlek: 16px** (upp från 15px)
- Radhöjd: 1.65 för brödtext, 1.15 för rubriker
- Hero-titel: `clamp(2.2rem, 4vw + 1rem, 4.8rem)`
- Section-rubriker: `clamp(1.5rem, 2vw + 0.5rem, 2.5rem)`
- Läsbredd på artikeltext: `max-width: 70ch`

### Navigering

**Desktop (≥1024px):**

- Horisontell meny, höjd 64px (upp från 56px)
- Behåll glass-effekt (`backdrop-filter: blur(20px)`)
- Behåll underline-animation på hover
- Lägg till subtil logo-mark före ordmärket: en liten inline-SVG (16×16px) med en cirkel i rust som innehåller en prick i marin. Ren geometrisk form, ingen komplex ikon. Används även som favicon-underlag.

**Tablet (640–1024px) + Mobil (<640px):**

- Brand vänster, hamburger-ikon höger
- Header stannar i rad (fixa nuvarande bugg där den kollapsar till kolumn)
- Klick → slide-in-panel från höger, 85% bredd, max 360px
- Backdrop: `rgba(28,25,23,0.45)` + `backdrop-filter: blur(6px)`
- Stäng-knapp (×) i panelens övre högra hörn
- Länkar vertikalt, 20px serif (Instrument Serif)
- Aktuell sida: rust-underline + fet
- Längst ner i panelen: subtil "Expertbyrån — Virtuellt konsultnätverk"
- Stänger vid: ESC, klick på backdrop, klick på länk
- Body scroll-lock vid öppen panel
- Focus-trap i panelen (a11y)
- `prefers-reduced-motion` → ingen glid, bara fade

### Komponenter

**GridCell** ([web/src/components/site/GridCell.tsx](../../../web/src/components/site/GridCell.tsx)):

- Skugga: `0 2px 20px rgba(0,0,0,0.04)` vid vila, `0 8px 32px rgba(0,0,0,0.08)` vid hover
- Vid hover: vänster-border glider in (3px solid rust), translateY(-3px) (befintligt), arrow animerar (befintligt)
- Border-radius: 14px (upp från 12px)

**Hero-sektion** (`SiteChrome` + startsida):

- Behåll radial-gradient-bakgrund
- Nytt: två dekorativa cirklar (mycket låg opacity, max 0.04) som fade-in efter load
- Behåll stagger-animation för eyebrow/titel/line/intro

**Sections — scroll-reveal:**

- Ny hook `useReveal()` (klient) — IntersectionObserver som sätter `data-revealed="true"`
- CSS: `opacity: 0; transform: translateY(16px); transition: 0.6s ease-out;` vid `data-revealed="true"` → `opacity: 1; transform: translateY(0);`
- Respekterar `prefers-reduced-motion`

**CTA-knappar (nytt):**

- Primär: `background: var(--accent)`, `color: white`, rundade 24px, padding 12px 24px, hover: `--accent-hover`
- Sekundär: `background: var(--marine)`, `color: white`, samma geometri
- Outline: `background: transparent`, `border: 1px solid var(--gray-300)`, `color: var(--black)`

**Tag/pill-komponent (nytt):**

- Rundade 20px, padding 4px 12px, 12px font, transparent accent-bakgrund, accent-textfärg
- Används för expertområden, roller, kategorier

**Footer:**

- 3 kolumner på desktop: brand+tagline / navigering (speglar header) / kort kontakt
- 1 kolumn på mobil
- Fortsatt subtil typografi

### Sidspecifika förbättringar

**Startsidan:**

- Hero med dekorativa cirklar
- Stat-rad med animerade siffror (räknar upp vid scroll-in via IntersectionObserver)
- Sektioner med scroll-reveal
- Nytt: en "Utvalda experter"-sektion (ny sektion på startsidan, placeras mellan nuvarande hero och befintliga sektioner). Visar 3 experter i bredare kort med porträttplaceholder, namn, roll och kort bio. Urvalet är de 3 första experterna från `site-data.json` (ingen ny metadata krävs).

**Experter-listan:**

- Behåll rutnätet (2 kolumner tablet, 3 desktop, 1 mobil)
- Hover-polish per spec ovan

**Expert-detalj:**

- Sidebar får subtil `--marine-light` bakgrund och rundade hörn
- Sticky sidebar på desktop, statisk på mobil/tablet (befintligt)

**Blogg-listan:**

- Första (senaste) artikeln "featured" i bredare kort (spänner över 2 kolumner)
- Övriga i 2-kolumnsrutnät på desktop, 1 på mobil
- Publiceringsdatum som pill i marin

**Blogg-artikel:**

- Max-width 70ch för brödtext
- Läsprogress-bar i topp (tunn rust-linje som fylls vid scroll)
- Metadata (datum, författare) som pills ovanför rubrik

**Team, områden, marknadsplats:**

- Polish-pass: uppdaterade kort, spacing, hover-effekter
- Inga strukturella ändringar

### Animationer — sammanfattning

| Animation                  | När           | Respekterar reduced-motion |
| -------------------------- | ------------- | -------------------------- |
| Hero stagger (befintligt)  | Vid load      | Ja                         |
| Dekorativa cirklar fade-in | Vid load      | Ja                         |
| Scroll-reveal sections     | Vid scroll-in | Ja (disableas)             |
| Stat-counter               | Vid scroll-in | Ja (sätts direkt)          |
| Hamburger slide-in         | Vid klick     | Ja (byter till fade)       |
| GridCell hover             | Vid hover     | Nej (redan snabb)          |
| Läsprogress-bar            | Vid scroll    | Ja (disableas)             |

## Teknisk struktur

**Nya filer:**

- `web/src/components/site/MobileNav.tsx` — client component med hamburger + slide-in-panel
- `web/src/components/site/MobileNav.module.css` — scoped styling
- `web/src/components/site/CTAButton.tsx` — knappkomponent (primär/sekundär/outline)
- `web/src/components/site/Pill.tsx` — tag/pill-komponent
- `web/src/components/site/RevealOnScroll.tsx` — wrapper som sätter `data-revealed` via IntersectionObserver
- `web/src/components/site/StatCounter.tsx` — animerad räknare
- `web/src/components/site/ReadingProgress.tsx` — för blogg-artiklar

**Uppdaterade filer:**

- `web/src/app/globals.css` — nya tokens, mobile-first media queries
- `web/src/components/site/SiteChrome.tsx` — integrerar MobileNav, logo-mark, uppdaterad footer
- `web/src/components/site/site.module.css` — stor uppdatering: responsive, nya breakpoints, animationer
- `web/src/components/site/GridCell.tsx` + `.module.css` — hover-polish
- Samtliga `page.tsx`-filer under `web/src/app/` — wrappa sektioner i `<RevealOnScroll>` där relevant
- Blogg-artikel-sidan — integrera `ReadingProgress`

**Ingen förändring av:**

- `site-data.json` eller `schema.ts`
- `store.ts` / `query.ts`
- `next.config.ts`, `tsconfig.json`, `package.json` (inga nya deps)
- Docker, CI/CD, dokumentation i `web/docs/`

## A11y & robusthet

- Hamburger-ikon: `aria-label="Öppna meny"` / `"Stäng meny"`, `aria-expanded`, `aria-controls`
- Focus-trap i panel (en enkel implementation utan extern lib)
- ESC stänger panelen
- Scroll-lock via `document.body.style.overflow` (återställs on cleanup)
- Alla nya animationer respekterar `prefers-reduced-motion`
- Semantik bevaras: `<nav aria-label="Primär navigering">` fortsätter finnas
- Kontraster testas mot WCAG AA: marin på vit, rust på vit, guld endast på text där kontrast håller (eller bara som bakgrund/border)

## Testning

- Befintliga Vitest-tester förblir gröna
- Nya komponenter (`MobileNav`, `RevealOnScroll`, `StatCounter`, `ReadingProgress`) får grundläggande tester för öppna/stäng-beteende och intersection-callbacks (mockad)
- Manuell testning i Chrome DevTools device mode: iPhone SE (375px), iPhone 14 Pro (393px), iPad (768px), Desktop (1440px)
- Verifiera att `npm run build` + `npm run lint` passerar

## Öppna frågor

Inga — alla val är gjorda. Eventuella justeringar sker under implementation.
