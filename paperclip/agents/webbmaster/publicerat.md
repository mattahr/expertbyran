---
type: "webmaster-state"
description: "Webbmasterns state-fil. Innehåller hashar per publicerad CV-sektion och en lista över publicerade nyhetsinlägg. Används för att göra publiceringen idempotent."
senast_uppdaterad: null
---

# Publicerat tillstånd

Detta är webbmasterns eget register över vad som finns publicerat på
den externa webbplatsen just nu. Uppdateras automatiskt efter varje
lyckad `Publicera:`-task.

## CV-hashar

Hashar per expert-CV. Om hashen matchar nuvarande innehåll i
`agents/<expert>/expertise.md` är CV:n redan publicerad → skip.

```yaml
cv_hashar: {}
```

(Tomt vid import. Första publicerings-tasken fyller i.)

## Publicerade inlägg

Lista över nyhetsinlägg och blog-artiklar som är live på webbplatsen.

```yaml
publicerade_inlagg: []
```

(Tomt vid import.)

## Publiceringshistorik

Kort logg över när publicerings-tasks körts.

```yaml
publiceringshistorik: []
```

(Tomt vid import.)
