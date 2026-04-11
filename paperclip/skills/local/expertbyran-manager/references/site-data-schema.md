# site-data.json — Schema

Filen `web/site-data.json` hämtas av en statisk webbserver och utgör all data för Expertbyråns publika webbplats. Du får **aldrig** bryta schemat — webbplatsen slutar fungera om ett fält saknas eller har fel typ.

## Toppnivå

```jsonc
{
  "version": 1,                        // number — schema-version, rör inte
  "updatedAt": "2026-04-11T17:00:00.000Z",  // ISO 8601 — uppdatera vid varje ändring
  "site": { ... },                     // statiskt — rör inte
  "organization": { ... },             // statiskt — rör inte
  "contact": { ... },                  // statiskt — rör inte
  "marketplace": { ... },              // statiskt — rör inte
  "expertAreas": [ ... ],              // array — lägg till vid behov
  "teams": [ ... ],                    // array — uppdatera expertSlugs vid behov
  "experts": [ ... ]                   // array — huvudfokus för denna skill
}
```

**Regel:** Ändra BARA `experts[]`, `expertAreas[]`, `teams[]` och `updatedAt`. Rör aldrig `site`, `organization`, `contact` eller `marketplace`.

## Expert-objekt (experts[])

Varje expert i arrayen har exakt denna struktur. Alla fält är **obligatoriska** om inte annat anges.

```jsonc
{
  "id": "expert-{slug}",              // string — prefix "expert-" + slug
  "slug": "förnamn-efternamn",         // string — kebab-case, unikt (personnamn eller beskrivande)
  "sortOrder": 10,                     // number — multipel av 10, unikt
  "featured": true,                    // boolean — visas på startsidan?
  "name": "Förnamn Efternamn",         // string — expertens fulla namn
  "role": "Rolltitel",                 // string — kort rollbeskrivning
  "location": "Virtuell nod, Stad",    // string — alltid "Virtuell nod, [stad]"
  "availability": "Kort beskrivning.", // string — en mening om tillgänglighet

  "areaSlugs": [                       // string[] — MÅSTE matcha expertAreas[].slug
    "strategisk-analys-styrning"
  ],

  "portrait": {
    "src": "/avatars/{slug}.svg",      // string — avatar-sökväg
    "alt": "Porträttillustration av {name}"  // string
  },

  "summary": "2-3 meningar...",        // string — sammanfattning för kortet
  "profileQuote": "Citat...",          // string — personligt citat, 1-2 meningar

  "strengths": [                       // string[] — exakt 3 stycken
    "Styrka 1",
    "Styrka 2",
    "Styrka 3"
  ],

  "metrics": [                         // array of {label, value} — 2-3 stycken
    { "label": "Etiketten", "value": "Värdet" }
  ],

  "selectedEngagements": [             // array — exakt 2 stycken
    {
      "title": "Uppdragstitel",        // string
      "client": "Klientbeskrivning",   // string — generisk, inte verkligt bolagsnamn
      "period": "2026",                // string — årtal
      "summary": "Kort beskrivning.",  // string — 1-2 meningar
      "impact": "Resultat/effekt."     // string — 1-2 meningar
    }
  ],

  "experience": [                      // array — 2-3 poster
    {
      "title": "Roll",                 // string
      "organization": "Organisation",  // string
      "period": "2024-",               // string — "YYYY-" för pågående
      "summary": "Beskrivning."        // string
    }
  ],

  "education": [                       // string[] — 2 poster
    "Examenstitel",
    "Fördjupning i ämne"
  ],

  "certifications": [                  // string[] — 2 poster
    "Certifiering 1",
    "Certifiering 2"
  ],

  "tools": [                           // string[] — 4 poster
    "Verktyg 1", "Verktyg 2", "Verktyg 3", "Verktyg 4"
  ],

  "methods": [                         // string[] — 4 poster
    "Metod 1", "Metod 2", "Metod 3", "Metod 4"
  ],

  "plugin": {
    "name": "expert-{slug}",           // string — "expert-" + slug
    "repositoryPath": "plugins/experts/{slug}",  // string
    "repositoryUrl": "https://github.com/mattahr/expertbyran-plugins",  // string — alltid detta
    "marketplaceListed": true,         // boolean
    "version": "1.0.0"                // string
  },

  "contactLinks": [                    // array — 2-3 poster, alltid email + calendar
    {
      "id": "{slug}-email",            // string
      "label": "Skicka e-post till {förnamn}",
      "type": "email",                 // "email" | "calendar" | "linkedin"
      "url": "mailto:{förnamn}.{efternamn}@expertbyran.ai",
      "description": "Kort beskrivning."
    },
    {
      "id": "{slug}-calendar",
      "label": "Boka möte med {förnamn}",
      "type": "calendar",
      "url": "https://calendar.app.google/{slug}",
      "description": "Kort beskrivning."
    }
    // Valfritt: linkedin-länk
  ]
}
```

## expertAreas-objekt (expertAreas[])

```jsonc
{
  "id": "area-{kort-id}",             // string
  "slug": "kebab-case-slug",          // string — refereras av experts[].areaSlugs
  "sortOrder": 10,                     // number — multipel av 10
  "featured": true,                    // boolean
  "accent": "#8D6F43",                // string — hex-färg
  "name": "Områdesnamn",              // string
  "shortDescription": "Kort text.",   // string — 1 mening
  "description": "Längre text.",      // string — 2-3 meningar
  "signals": ["Signal 1", ...],       // string[] — exakt 3
  "deliverables": ["Leverabel 1", ...]// string[] — exakt 3
}
```

### Befintliga areaSlugs

| slug | namn |
|------|------|
| `strategisk-analys-styrning` | Strategisk analys och styrning |
| `ai-produkt-tjanstedesign` | AI-produkt och tjänstedesign |
| `data-automation-operativ-effektivitet` | Data, automation och operativ effektivitet |
| `regulatorik-risk-kvalitet` | Regulatorik, risk och kvalitet |

## teams-objekt (teams[])

```jsonc
{
  "id": "team-{slug}",
  "slug": "kebab-case-slug",
  "sortOrder": 10,
  "featured": true,
  "name": "Team Namn",
  "shortDescription": "...",
  "description": "...",
  "promptSummary": "...",
  "expertSlugs": ["astrid-rane", ...], // string[] — MÅSTE matcha experts[].slug
  "plugin": {
    "name": "team-{slug}",
    "repositoryPath": "plugins/teams/{slug}",
    "repositoryUrl": "https://github.com/mattahr/expertbyran-plugins",
    "marketplaceListed": true,
    "version": "1.0.0"
  }
}
```

## Valideringsregler

1. **areaSlugs** i varje expert MÅSTE matcha en befintlig `expertAreas[].slug`
2. **expertSlugs** i varje team MÅSTE matcha en befintlig `experts[].slug`
3. **id** måste vara unikt inom sin array
4. **slug** måste vara unikt inom sin array
5. **sortOrder** bör vara unikt inom sin array (multiplar av 10)
6. **updatedAt** måste uppdateras till aktuellt datum vid varje ändring
7. Alla texter på **svenska** med korrekta å, ä, ö
