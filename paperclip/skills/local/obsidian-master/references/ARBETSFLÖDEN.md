# Arbetsflöden

Sex arbetsflöden täcker alla tasks obsidian-master hanterar. Identifiera rätt flöde baserat på task-beskrivningen och följ stegen.

## Arbetsflöde 1: Ta emot granskningsbegäran från expert

**Experter skriver sina utkast själva** i `/Experter/[slug]/` via
skillen `obsidian-global`. Du skapar inga utkast — du **granskar
befintliga**.

Task-titeln avgör vilket läge:

- `Obsidian-feedback:` — expert vill ha råd, **ingen publicering**
- `Obsidian-publicera:` — expert vill att utkastet flyttas till
  `/Områden/` (se Arbetsflöde 2 för publicering)

### Läge A: `Obsidian-feedback:` — kritik/råd utan publicering

**Trigger:** task med titel `Obsidian-feedback:`. Description har
länk till expertens utkast och frågor om vad hen vill ha feedback på.

**Steg:**

1. **Läs utkastet** och expertens frågor. Anteckna vad som är
   påstående, tolkning respektive fråga.
2. **Sök efter duplicates i vaulten.** Graf + sök på sökord +
   wikilink-backlinks. Kontrollera:
   - Finns redan en publicerad konceptnot i samma område?
   - Finns annan expertnot (hos samma eller annan expert) som berör
     samma sak?
3. **Granska innehåll och källor.** För varje påstående med
   källhänvisning, kör lätt verifiering (Arbetsflöde 4, men utan att
   skapa källnoter än — det görs vid publicering).
4. **Svara på tasken** med konkret feedback:
   - Formuleringsförslag
   - Källor som saknas, är svaga, eller inte stödjer påståendet
   - Duplikat-observation ("redan täckt i [[X]]" eller "nära [[Y]]")
   - Rekommenderad nästa åtgärd (revidera och skicka ny feedback-
     task, eller skicka publicera-task när klar)
5. **Ingen flytt.** Utkastet stannar i `/Experter/[slug]/`.

### Läge B: expert har ingen task men du hittar utkast utan uppföljning

Om du under annan task upptäcker ett utkast som länkats in från en
publicerad not eller som verkar klart men aldrig har skickats till
dig — **skicka notis-task tillbaka till experten** med fråga om
status. Starta inte publicering på eget initiativ.

## Arbetsflöde 2: Flytta utkast → publicerad

**Trigger:** Task med titel `Obsidian-publicera:`. Description har länk till utkastet, lista med källor (URL:er) som experten använt, förslag till område, och motivering att kunskapen är kanonisk.

**Steg:**

1. **Kontrollera verifieringsstatus.** Alla påståenden i noten ska ha fotnot till källnot. Om inte → Arbetsflöde 4 för saknade källor först.
2. **Kontrollera att källorna är primära eller sekundära.** Tertiära källor → degradera tillbaka till utkast och dialog med expert.
3. **Bestäm rätt `/Områden/`-mapp.**
   - Metodkunskap (hur man arbetar) → `/Områden/Metod/[område]/`
   - Domänkunskap (vad som gäller inom ett sakområde) → `/Områden/Domän/[område]/`
   - Cross-cutting → `/Områden/Allmänt/[område]/`
   - Vid tveksamhet: dialog med experten eller konsultchef.
4. **Flytta filen** från `/Experter/[expert]/` till `/Områden/.../`.
5. **Uppdatera frontmatter:**
   - Byt `typ: expertnot` → `typ: konceptnot`
   - Sätt `status: publicerad`
   - Sätt `område: "[[_område]]"` (wikilink till MOC)
   - Uppdatera `ändrad:` till dagens datum
   - Sätt `senaste-översyn:` till dagens datum
6. **Uppdatera MOC** i området. Lägg till wikilink till den nya konceptnoten, gruppera under rätt rubrik.
7. **Uppdatera expertprofilen** — lägg till noten i listan över bidrag (om relevant).
8. **Uppdatera `/00_Index/områdeskarta.md`** om detta är första noten i ett nytt område.
9. **Bakåtlänka** från expertnoten som nu är tom (om den finns kvar som spår): sätt `publicerad_i: "[[ny-konceptnot]]"`. Annars radera den gamla filen.
10. **Rapportera:** vilken not, vilken plats, vilka länkar som uppdaterats.

## Arbetsflöde 3: Uppdatera befintlig konceptnot

**Trigger:** Task säger "uppdatera X med ny info" eller expert har rapporterat rättelse.

**Steg:**

1. **Hitta noten.** Via sök, graf eller explicit wikilink.
2. **Bedöm ändringens natur:**
   - **Mindre rättelse eller tillägg** (ny siffra, förtydligande, ny källa) → redigera i befintlig not.
   - **Fundamental omformulering** eller motstridande innehåll → skapa ny konceptnot med `ersätter: "[[gammal-not]]"`. Sätt gamla notens `status: föråldrad` och lägg backlinking.
3. **Verifiera ny information** — Arbetsflöde 4 för nya källor.
4. **Uppdatera frontmatter:**
   - `ändrad:` → dagens datum
   - `senaste-översyn:` → dagens datum
   - `osäkerhet:` justera vid behov
5. **Uppdatera MOC** om noten bytt rubrikgrupp eller om en ersättande ny not skapats.
6. **Dialog med expert** om ändringen påverkar andra konceptnoter som länkar hit (wikilink-backlinks i Obsidian visar vilka).
7. **Rapportera:** före/efter, vilka andra noter som potentiellt påverkas.

## Arbetsflöde 4: Hantera källor

**Trigger:** Delflöde från 1, 2, 3 när en ny eller befintlig källa ska kopplas.

**Steg:**

1. **Sök efter befintlig källnot.**
   - `/Källor/tryck/` för SOU/prop/betänkande
   - `/Källor/myndigheter/` för organisationer
   - `/Källor/lagrum/` för lagar
   - `/Källor/databaser/` för öppna data
   - `/Källor/personer-externt/` för namngivna primärvittnen
2. **Om källnot finns** — använd den. Wikilänka från konceptnoten.
3. **Om källnot saknas** — skapa från mall [mall-källa.md](../mallar/mall-källa.md):
   - Följ filnamnsregeln (`SOU-YYYY-N.md`, `bet-YYYY-YY-XX.md`, etc. — se [VAULT.md](VAULT.md))
   - Fyll i frontmatter komplett
   - Inkludera relevant citat från källan i brödtexten
4. **Bedöm trovärdighet** enligt matrisen i [VERIFIERING.md](VERIFIERING.md).
5. **Verifiera URL** — hämta sidan, bekräfta att påståendet stöds. Misslyckande → dialog med expert.
6. **Uppdatera `/00_Index/källkatalog.md`** om källan är den första i sin kategori eller organisation.

## Arbetsflöde 5: Strukturellt underhåll (autonomt tillåtet)

**Trigger:** Task säger "underhåll vaulten", "laga brutna länkar", "uppdatera MOC:er", eller du upptäcker problem i annan task.

**Detta får ske självständigt utan expertdialog — men endast struktur, aldrig innehåll.**

**Möjliga åtgärder:**

1. **Brutna wikilinks.** Obsidian visar dem automatiskt. Laga om målfil har bytt namn; skapa stub om målet borde finnas; flagga om oklart.
2. **MOC-uppdatering.** För varje område, se till att alla publicerade konceptnoter i mappen är listade i MOC:en. Gruppera logiskt (förslag: efter underämne).
3. **Cross-linking.** När två publicerade konceptnoter behandlar samma sak, lägg till wikilinks i "Se även"-avsnitt. Gör detta **konservativt** — bara när kopplingen är tydlig.
4. **Index-underhåll.** Uppdatera `/00_Index/expertkarta.md`, `/00_Index/områdeskarta.md`, `/00_Index/källkatalog.md` vid behov.
5. **Sortering.** Håll MOC:er och index alfabetiskt sorterade (eller i logisk ordning om det finns naturlig sekvens).

**Får inte:**

- Ändra formuleringar i konceptnoter
- Lägga till eller ta bort påståenden
- Klassificera om källors trovärdighet
- Ändra `status:`-fält

## Arbetsflöde 6: Föråldring

**Trigger:** Task säger "gå igenom föråldrad kunskap", eller du upptäcker en konceptnot med `senaste-översyn:` äldre än ~12 månader under annan task.

**Du söker inte själv efter nyare information eller ersättande källor.** Ditt jobb är att kontrollera tekniskt och flagga till ansvarig expert för bedömning.

**Steg:**

1. **Identifiera kandidater.** Filtrera konceptnoter där `senaste-översyn:` är > 12 månader.
2. **Kontrollera tekniskt.** För varje not:
   - Svarar källnot-URL:erna fortfarande? (HTTP-check)
   - Finns notens MOC-länk och övriga wikilinks? (graf-check)
3. **Flagga till ansvarig expert** via task. Inkludera:
   - Länk till noten
   - `senaste-översyn:`-datum och ålder
   - Eventuella tekniska issues (brutna URL:er, brutna länkar)
   - Fråga: är innehållet fortfarande aktuellt, eller behöver det uppdateras/ersättas?
4. **Avvakta expertens svar.** Själva uppdateringen sker via en ny task som triggar Arbetsflöde 3 eller ett nytt utkast.
5. **Rapportera:** vilka noter granskade, vilka flaggade, vilka hade tekniska issues.

---

## Dialogmönster med expert

Obsidian-master pratar aldrig "bara med sig själv" när det gäller innehåll. Här är mönstren för vanliga situationer.

### Dialogmönster: Källa saknas

> **Agent:** För påståendet "X leder till Y" har jag inte hittat någon primärkälla. Kan du peka på en SOU, prop, myndighetspublikation eller motsvarande som stödjer påståendet? Alternativt: kan påståendet tonas ner till "X associeras med Y" utan kausal formulering?

### Dialogmönster: Källa svag (tertiär)

> **Agent:** Den referens du lämnat, [X], är en blogg utan spårbar auktoritet — tertiär i vår källkritikmatris. Kan du peka på en primär eller sekundär källa som stödjer samma påstående? (T.ex. SOU, proposition, myndighetspublikation eller peer-reviewed artikel.) Om du inte hittar en bättre källa kan vi välja att tona ner påståendet eller avstå från att publicera det.

### Dialogmönster: Källa stödjer inte påståendet

> **Agent:** Jag har läst [källa X]. Där står: "[citat]". Ditt påstående i noten är: "[påstående]". Jag ser inte att källan stödjer just den formuleringen. Kan vi antingen (a) omformulera påståendet, (b) byta källa, eller (c) ta bort påståendet?

### Dialogmönster: Duplikat upptäckt

> **Agent:** Din nya kunskap om [Z] överlappar med befintlig konceptnot [[regression-med-kontrollvariabler]], publicerad 2026-02. Tre alternativ:
>
> 1. **Ersätt** — din version blir ny publicerad, den gamla markeras `föråldrad` och backlinks uppdateras.
> 2. **Komplettera** — jag integrerar din text i befintlig not.
> 3. **Parallellt** — vi har två noter om olika aspekter, med tydlig wikilink mellan dem.
>
> Vilket föredrar du?

### Dialogmönster: Formulering oklar

> **Agent:** Meningen "[citat]" kan tolkas på två sätt:
>
> 1. [Tolkning A]
> 2. [Tolkning B]
>
> Vilken avser du? (Eller en tredje formulering jag missat?)

### Dialogmönster: Föråldrad källa

> **Agent:** Din konceptnot [[X]] refererar till [källa, publicerad ÅÅÅÅ] och har `senaste-översyn: ÅÅÅÅ-MM`. Den är nu > 12 månader gammal. Kan du granska om innehållet och källan fortfarande är aktuella? Om något behöver uppdateras, skicka en ny task med de nya referenserna. Om noten fortfarande är aktuell kan jag bara uppdatera `senaste-översyn:`-datumet.

---

## Tips för effektiv sökning i vaulten

Obsidians sök + graf är dina primära verktyg.

- **Sök på frontmatter-fält:** `tag:statistik`, `"expert: metod-statistik-petra"` (i quick switcher + search)
- **Wikilink-backlinks:** varje not har en baksida med vilka andra noter som länkar hit — använd för impact-analys
- **Graph view filtrerat per expert/område** för att hitta "luckor" i kunskapen
- **Orphan-sökning** (filer utan inlänkar) — hitta noter som inte är integrerade i grafen, kandidater för MOC-uppdatering
