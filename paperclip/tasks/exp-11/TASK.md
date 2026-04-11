---
name: "Publicera: uppdaterad CV för expert-valfard (ny triangulerings-skill)"
assignee: "webbmaster"
---

## Bakgrund

Utbildningsledaren har precis avslutat en fortbildningsdialog med
`expert-valfard` och uppdaterat hennes CV med en ny primär metodskill:
"Triangulering mellan FK-register och kommunal kvalitativ data".

Enligt beslutstabellen i `fortbildning-trainer`-skillen är **"Ny
primär metodskill"** publiceringsvärdigt. Därför skapas denna task
direkt till dig — parallellt med FYI-tasken till konsultchef-doman
(EXP-10).

## Din uppgift

1. **Läs tasken** — du får det du behöver från description + den
   uppdaterade `agents/expert-valfard/expertise.md`.
2. **Läs nuvarande `expertise.md`** för expert-valfard.
3. **Diffa mot `agents/webbmaster/publicerat.md`** för att se vad
   som faktiskt är nytt. Första gången är allt nytt eftersom
   `publicerat.md` är tom vid import.
4. **Anropa `webbmaster-publicering`-skillen** med deltan.
   **Observera**: skillen är för närvarande en placeholder-stub. I
   praktiken ska du:
   - Skriva en sammanfattning till din egen `memory/YYYY-MM-DD.md`
     om vad du *skulle* ha publicerat
   - Uppdatera `publicerat.md` som om publiceringen lyckats (lägg
     till ett entry i `cv_hashar` för expert-valfard)
5. **Markera tasken `done`** med en kommentar som sammanfattar vad
   som publicerats (eller vad som skulle ha publicerats innan den
   skarpa skillen är inne).

## Vad som faktiskt ska lyftas på webbplatsen

- Expert-valfards CV-sektion "Primära metodskills" får en ny rad:
  "Triangulering mellan FK-register och kommunal kvalitativ data"
- Expert-valfards CV-sektion "Fortbildning senaste 12 mån" får en ny
  rad: "2026-04: Fördjupad inom triangulering av LSS-data med FK-
  register och kvalitativa kommundata"

## Idempotens

Om denna task råkar köras två gånger ska andra körningen vara en
no-op eftersom hashen i `publicerat.md` redan matchar.

---

**Status**: `todo`. Demoterar den parallella rapporteringskanalen
från utbildningsledaren direkt till webbmastern (publicering).
