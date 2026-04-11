---
name: "Klient-Riksrevisionen"
title: "Fasadagent för extern kundautentisering (aldrig körs)"
---

# Fasadagent — inte en operativ roll

Detta är en **minimal fasadagent** som finns enbart för API-nyckel-
autentisering. Agenten körs aldrig, tas inte emot tasks och deltar
aldrig i någon arbetsflödes-logik. Hon står utanför Expertbyråns
hierarki och har ingen `reportsTo`.

## Varför finns hon?

Paperclip saknar *scoped* API-nycklar. Alla agent-API-nycklar ger bred
åtkomst till företaget. För att kunna separera den externa kunden
(Riksrevisionens Claude Code-process) från bolagets interna operationer
skapar vi en fasadagent som kundens process kan autentisera *som*.

Fördelarna:

1. **Spårbarhet**: Alla issues som skapas av den externa kunden är
   authored av `klient-riksrevisionen` i Paperclip-aktivitetsloggen.
   Det gör det lätt att filtrera kundförfrågningar från interna tasks.
2. **Separation av intent**: Även om nyckeln tekniskt kan göra mer,
   signalerar identiteten att denna anropare är en kund och ska
   följa kundprotokollet.
3. **Lätt återkallelse**: Om nyckeln läcker eller måste roteras,
   pausar man bara denna agent eller tar bort nyckeln — ingen annan
   del av bolaget påverkas.

## Hur används nyckeln?

En extern process (t.ex. en Claude Code-agent med Obsidian som
kunskapsbas) skaffar en API-nyckel via:

```
POST /api/agents/klient-riksrevisionen/keys
```

Nyckeln används sedan för alla anrop mot paperclip-API:et enligt
kundprotokollet (se `kundprotokoll-klientsida`-skillen). Alla issues
den skapar ska ha:

- `assigneeAgentId: "klientkoordinator"`
- `description` börjar med `protocol: "expertbyran/v1"`-frontmatter

## Konfiguration

I `.paperclip.yaml`:

- `role: "client"`
- `runtime.heartbeat.enabled: false` — kör aldrig
- `reportsTo`: **ej satt**, står utanför hierarkin

## Säkerhetsmodellen

Full beskrivning finns i designdokumentet
[`../../docs/expertbyran-design.md`](../../../docs/expertbyran-design.md)
sektion 6.4 ("Säkerhet"). Kort sammanfattning:

1. **Nätverksgräns**: Paperclip lyssnar på `localhost:3100`, endast
   lokala processer kan nå API:et.
2. **Fasadagent**: denna agent, för spårbarhet.
3. **Konventionsfiltrering**: klientkoordinatorn processar bara issues
   med `protocol: "expertbyran/v1"`.

Detta är inte en stark teknisk spärr, men räcker för syftet att
separera gränssnitten.
