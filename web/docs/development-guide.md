# Development Guide

## Lokal utveckling

Installera beroenden:

```bash
npm install
```

Starta utvecklingsläge:

```bash
npm run dev
```

Skapa `.env` eller `.env.local` från `.env.example`. Lokalt pekar `DATA_DIR` mot `data`; sätt `API_TOKEN` för att kunna göra muterande API-anrop. `npm run dev` skapar en tom SQLite-databas (`web/data/expertbyran.db`) — det finns ingen seed-mekanism, så sidorna visar tomlägen tills innehåll skapas via API:et. Ligger gamla JSON-filer (legacy-formatet) i datakatalogen importeras de automatiskt vid första start.

**Gotcha:** använd relativt `DATA_DIR=data` lokalt — `DATA_DIR=app/data` skapar `web/app/` som skuggar App Router och 404:ar alla routes.

## Produktionslik lokal körning

```bash
npm run build
npm start
```

Viktiga env vars:

- `HOSTNAME`
- `PORT`
- `DATA_DIR`
- `API_TOKEN`
- `SKIP_LEGACY_IMPORT`

## Test och kontroll

Kör alltid:

```bash
npm run lint
npm run test
npx tsc --noEmit
```

## Vanliga ändringar

### Ändra schema

1. Uppdatera `src/lib/content/schema.ts`
2. Uppdatera testfixturen i `src/test/fixtures/site-data.fixture.json`
3. Uppdatera de publika schemafilerna i `public/schemas/`
4. Uppdatera docs
5. Kör testsviten

### Byta lagringsbackend

Innehåll nås via lagringsabstraktionen (`ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore`, `ForesightStore`). Produktionsbackenden är SQLite (`node:sqlite`, kräver Node 22); minnesbackenden används i tester. En ny backend ska klara den delade kontraktssviten i `src/lib/stores/store-contract.ts` — byt implementation i kompositionsroten, inte i sidkoden.

Justera drift via env vars, inte applikationskoden:

- `DATA_DIR`
- `API_TOKEN`
