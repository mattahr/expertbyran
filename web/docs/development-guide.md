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

Skapa `.env` eller `.env.local` från `.env.example`. Lokalt pekar `DATA_DIR` mot `data`; sätt `API_TOKEN` för att kunna göra muterande API-anrop. Innehåll seedas från `web/site-data.json` om datakatalogen är tom.

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

Innehåll nås via lagringsabstraktionen (`ConfigStore`, `ContentStore`, `BlogStore`). De filbaserade implementationerna kan bytas mot t.ex. en databasbackend utan att konsumenterna ändras — byt implementation i kompositionsroten, inte i sidkoden.

Justera drift via env vars, inte applikationskoden:

- `DATA_DIR`
- `API_TOKEN`
