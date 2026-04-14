# Fix: Refresh-funktionalitet blockerades av DNS-proxy

## Problem

När användare besökte webbplatsen med `/refresh` skulle både `site-data.json` och `blog-data.json` hämtas från GitHub för att uppdatera webbplatsens cache. Detta fungerade inte för de två senaste bloggpubliceringarna.

### Grundorsak

Tidigare implementering försökte bypassa GitHubs CDN-cache (som har 300s TTL) genom att använda GitHub API istället för `raw.githubusercontent.com`:

```typescript
// Gammal kod
const fetchUrl = bypassCdn ? toGitHubApiUrl(url) ?? url : url;
```

Detta konverterade URLs som:
- `https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/blog-data.json`

Till GitHub API-URLs:
- `https://api.github.com/repos/mattahr/expertbyran/contents/web/blog-data.json?ref=main`

**Problemet**: GitHub API-anrop blockerades av DNS monitoring proxy med HTTP 403:
```
Blocked by DNS monitoring proxy
```

## Lösning

Istället för att använda GitHub API använder vi nu en cache-busting query parameter på `raw.githubusercontent.com`-URLerna:

```typescript
// Ny kod
const fetchUrl = bypassCdn ? `${url}?t=${Date.now()}` : url;
```

Detta ger URLs som:
- `https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/blog-data.json?t=1776171048013`

### Fördelar med denna lösning

1. **Fungerar utan API-åtkomst**: Använder publika raw-URLs som inte blockeras
2. **Enklare**: Ingen URL-transformation eller speciella headers behövs
3. **Effektiv cache-busting**: Timestamp-parametern säkerställer att CDN:en hämtar färsk data
4. **Samma funktionalitet**: Uppnår samma mål som GitHub API-metoden men på ett mer robust sätt

## Ändrade filer

1. `/web/src/lib/content/store.ts` - Cache-busting för site-data.json
2. `/web/src/lib/blog/store.ts` - Cache-busting för blog-data.json och markdown-filer

## Verifiering

Kör testerna för att verifiera att allt fungerar:

```bash
npm run test -- src/lib/content/store.test.ts src/lib/blog/store.test.ts
```

Eller testa refresh-funktionen manuellt med testsriptet:

```bash
node /tmp/test-refresh-fix.mjs
```

## Relaterat

- Issue: Uppdate av web vid refresh verkar inte fungera
- Problem identifierat: 2026-04-14
- Fix implementerad: 2026-04-14
