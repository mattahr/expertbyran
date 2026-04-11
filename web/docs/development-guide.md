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

För att använda en fjärrsnapshot, sätt:

```bash
SITE_DATA_URL=https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/site-data.json
```

## Produktionslik lokal körning

```bash
npm run build
npm start
```

Viktiga env vars:

- `HOSTNAME`
- `PORT`
- `SITE_DATA_URL`
- `SITE_DATA_REVALIDATE_SECONDS`
- `SITE_DATA_FETCH_TIMEOUT_MS`

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

### Ändra drift mot GitHub

Uppdatera env vars, inte applikationskoden:

- `SITE_DATA_URL`
- `SITE_DATA_REVALIDATE_SECONDS`
- `SITE_DATA_FETCH_TIMEOUT_MS`
