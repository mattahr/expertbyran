---
name: "webbmaster-publicering"
description: "PLACEHOLDER-STUB. Kontraktsdeklaration för webbmasterns publicering till extern webbplats. Byts ut mot skarp extern skill senare. Tills dess loggar webbmastern till memory."
slug: "webbmaster-publicering"
metadata:
  paperclip:
    slug: "webbmaster-publicering"
    skillKey: "local/expertbyran/webbmaster-publicering"
  skillKey: "local/expertbyran/webbmaster-publicering"
key: "local/expertbyran/webbmaster-publicering"
---

# Webbmaster-publicering — placeholder

> **⚠️ TODO: Denna skill är en placeholder-stub som ska bytas ut mot
> en skarp extern skill senare.** Tills den skarpa skillen är på
> plats ska webbmastern följa "stub-beteendet" som beskrivs i slutet
> av denna fil.

## Syfte

Denna skill är kontraktet mellan webbmastern och Expertbyråns
externa webbplats. När den skarpa skillen levereras ska den
tillhandahålla följande operationer:

### Kontraktsoperationer

| Operation       | Input                                       | Utfall                                      |
|-----------------|---------------------------------------------|---------------------------------------------|
| `publish-cv`    | Expert-slug + diff mot publicerat           | CV-sidan uppdaterad på webbplatsen          |
| `publish-blog`  | Titel, body (markdown), författare          | Nytt blog-inlägg publicerat                 |
| `update-blog`   | Inlägg-ID, ny body                          | Befintligt inlägg uppdaterat                |
| `delete-cv`     | Expert-slug                                 | CV-sidan borttagen (när expert lämnar)      |
| `delete-blog`   | Inlägg-ID                                   | Inlägget borttaget                          |
| `get-status`    | —                                           | Aktuellt tillstånd på webbplatsen (för diff)|

### Förväntad beteende för den skarpa skillen

Den skarpa skillen ska:

1. Vara idempotent — samma operation två gånger är en no-op
2. Returnera strukturerade fel som webbmastern kan logga
3. Hantera nätverksfel graciöst (retry, backoff)
4. Uppdatera `agents/webbmaster/publicerat.md` efter varje lyckad
   operation
5. Följa webbplatsens redaktionella stil enligt webbmasterns
   `SOUL.md`

## Stub-beteende (innan skarpa skillen är på plats)

**Tills den skarpa skillen är levererad ska webbmastern INTE göra
externa anrop.** Istället:

### Vid `publish-cv`-operation

1. Läs den relevanta `agents/<expert>/expertise.md`
2. Beräkna en **hash** av CV-innehållet:
   - Normalisera whitespace
   - Exkludera `senast_uppdaterad`-fält (ändras för mycket)
   - SHA-256 av resten
3. Jämför med `cv_hashar[<expert>]` i `publicerat.md`
4. Om hashen är oförändrad → skip (no-op)
5. Om hashen är ny eller ändrad:
   - Skriv en sammanfattning till
     `agents/webbmaster/memory/YYYY-MM-DD.md`:

     ```markdown
     ## <tidpunkt> — STUB: publish-cv
     Expert: <slug>
     Nya/ändrade sektioner: <lista>
     Skarp skill saknas — inget externt anrop gjort.
     Ny hash: <hash>
     ```

   - Uppdatera `publicerat.md`:
     - Lägg till/uppdatera `cv_hashar[<expert>]: <ny-hash>`
     - Lägg till rad i `publiceringshistorik` med datum, operation,
       expert, stub-flag

6. Markera tasken `done` med kommentar:

```markdown
Stub-publicering utförd.

- Expert: <slug>
- CV-hash uppdaterad i publicerat.md
- Ingen extern webbplats-anropad (skarp skill saknas)
- Loggat i memory/<datum>.md

När den skarpa webbmaster-publicering-skillen är levererad kommer
denna task att producera faktiska externa anrop.
```

### Vid `publish-blog`-operation

Samma mönster:

1. Läs description från `Publicera:`-tasken
2. Skriv en blog-post-fil i `agents/webbmaster/memory/YYYY-MM-DD.md`
   med rubrik, body, författare
3. Lägg till entry i `publicerat.md` under `publicerade_inlagg`
4. Markera tasken `done` med stub-kommentar

### Publicerat.md-format

Webbmastern underhåller `agents/webbmaster/publicerat.md`:

```yaml
---
type: "webmaster-state"
description: "..."
senast_uppdaterad: "2026-04-12T14:32:00"
---

# Publicerat tillstånd

## CV-hashar

cv_hashar:
  effektivitetsrevisor: "a1b2c3d4..."
  kvantitativ-analytiker: "e5f6a7b8..."
  ...

## Publicerade inlägg

publicerade_inlagg:
  - id: "blog-2026-04-12-lss-triangulering"
    titel: "Ny specialisering: LSS-triangulering"
    datum: "2026-04-12"
    författare: "Dr Karin Bergström"
    stub: true

## Publiceringshistorik

publiceringshistorik:
  - datum: "2026-04-12T14:32:00"
    operation: "publish-cv"
    target: "expert-valfard"
    stub: true
  - ...
```

Kommentarsfältet `stub: true` markerar att detta är en
stub-publicering, inte en skarp.

## När den skarpa skillen levereras

När `webbmaster-publicering`-skillen byts ut mot en skarp extern
version, ska mallen:

1. Ersätta denna fil helt
2. **Inte ändra** `publicerat.md` — den redan existerande
   state-filen är framåtkompatibel
3. Efter import, webbmastern ska vid nästa `Publicera:`-task
   automatiskt detektera att skarpa skillen finns och börja göra
   riktiga externa anrop
4. `stub: true`-markeringarna i `publicerat.md` kan rensas bort
   eller lämnas som historik

## Instruktion till framtida implementerare

Om du är agenten eller utvecklaren som levererar den skarpa skillen:

- **Läs webbmasterns `AGENTS.md` och `SOUL.md`** för att förstå
  tonläget och roll
- **Läs `agents/webbmaster/publicerat.md`** för att se vilket
  tillstånd som finns
- **Implementera alla 6 kontraktsoperationerna** (se tabellen)
- **Dokumentera webbplatsens endpoint och autentisering** i skillen
- **Testa idempotensen** — kör samma operation två gånger och
  verifiera att andra körningen är en no-op

## Referenser

- `agents/webbmaster/AGENTS.md` — webbmasterns roll
- `agents/webbmaster/SOUL.md` — redaktionell röst
- `agents/webbmaster/publicerat.md` — state-fil
- `fortbildning-trainer` — beslutstabell för vad som är
  publiceringsvärt (utbildningsledarens ansvar)
