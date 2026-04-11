---
name: "Exempeluppdrag: Frekvenstilldelning"
description: "Avslutat demo-uppdrag som visar hela kundprotokollet från förfrågan till leverans."
---

# Exempeluppdrag: Frekvenstilldelningens effektivitet

Detta är ett **avslutat exempeluppdrag** som Expertbyrån tog under
Q1 2026 för att stödja Riksrevisionens (hypotetiska) granskning av
frekvenstilldelningens effektivitet. Uppdraget är med i mallen som
referens och demonstration av hela kundprotokollet från mottagen
förfrågan till levererat slutdokument.

## Vad uppdraget innehöll

Riksrevisionen gjorde en granskning av hur PTS (Post- och
telestyrelsen) tilldelar frekvensutrymme till mobiloperatörer och
om processen är effektiv ur statens perspektiv. Expertbyrån hyrdes
in för metodstöd:

- **Effektivitetsrevisor** som projektledare och designmatris-ägare
- **Kvantitativ analytiker** för marknadsanalys av spektrumpriser
- **Rättslig utredare** för tolkning av regleringsbrev till PTS

(Ingen av Expertbyråns fyra permanenta domänexperter hade
telekom-kompetens — det var en påminnelse om att vi saknar expertis
på området och kan behöva hyra en ny domänexpert via
`paperclip-create-agent`-skillen om fler uppdrag inom området kommer.)

## Flödet i korthet

1. **Klient-Riksrevisionen** skapade ett rot-issue med
   `protocol: "expertbyran/v1"` och `role_hint: "metodstöd + domänexpert"`
2. **Klientkoordinatorn** triagerade, körde `kompetensmatchning`, och
   skapade subtasks till de tre experterna
3. **Effektivitetsrevisorn** levererade en designmatris som bas för
   hela granskningen
4. **Kvantitativa analytikern** levererade en registerbaserad analys
   av spektrumpriser från 2015–2025
5. **Rättsliga utredaren** levererade ett tolkningsutlåtande om PTS
   regleringsbrev 2020–2025
6. **Klientkoordinatorn** aggregerade de tre leveranserna till ett
   strukturerat leveransdokument via
   `PUT /api/issues/{rotid}/documents/leverans`
7. **Klientkoordinatorn** skapade en puls-task till
   utbildningsledaren för retrospektiv

## Lärdomar för mallen

Detta uppdrag visar några nyckelinsikter som påverkar hur mallen är
upplagd:

- **Vi saknar telekomkompetens** permanent — en framtida
  domänexpert inom infrastruktur kan bli aktuell
- **Retrospektiven efter uppdraget** triggade en fortbildningsdialog
  för effektivitetsrevisorn om marknadsanalyser i
  telekom-sammanhang (se EXP-8 i exempeltaskarna)
- **Kundprotokollet fungerade** end-to-end och lade grunden till
  mallen för framtida uppdrag

## Status

`done` — leverans gjordes 2026-Q1.
