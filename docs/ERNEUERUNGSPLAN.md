# Lindendorf — Erneuerungsplan

**Gültig ab:** 20. September 2026  
**Repo:** [PromptBrainless/SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0)  
**Rohfassung:** `docs/lindendorf-erweiterung-plan.md`  
**Dieses Blatt ersetzt** die technische Reihenfolge in `VORPLANUNG_VIER_PHASEN.md`, den „nächsten Schritt“ in älteren Handoffs und die Annahme, Mühle/Brunnen lägen noch in `script.ts`.

Leitprinzip: jeder Schritt bleibt allein spielbar. Reihenfolge nach Bruchrisiko, nicht nach Spannung.

Fluss unverändert:

> Heldenerstellung → Prolog → Dorf-Schleife → Glockenweg/Wald → Banditenlager → Ende

---

## Zustandsmuster (drei, nicht vermischen)

| Muster | Wo | Wann neu setzen |
|---|---|---|
| Boolean/Enum am Held | `sannaGeholfen`, `loesungswegMuehle`, … | Bestehende Quests. Nicht durch Log ersetzen. |
| Gunst/Last | `held.effekte: EffektId[]` | Ortswechsel, SL, Lagen. Probe rechnet sie **vor** `probe()`. |
| Entscheidungs-Log | `held.entscheidungen` | **Neu.** Nur Ruf, Erinnerung, Weg, Wissen-Protokoll. Noch nicht verdrahtet. |

Ruf niemals als extra Zahlenfeld am Held. Ruf = `rufAus(held, ziel)` über das Log. Kein Decay.

Wissen bleibt an `held.name` gebunden. Kein Kapitel-Reset.

---

## Ist-Stand (Code, nicht der Rohplan)

Der Rohplan ist an einer Stelle überholt: Mühle, Brunnen und Kesseljahr **sind bereits Module**. Das Lager und der Hauptfluss liegen weiter in `script.ts`. Intro-Pilot in `content.ts`. Save merged mit `createHeld()`. `isHeld()` prüft nur grob.

| Rohplan-Schritt | Status |
|---|---|
| 1 HeldSchema | **drin** `heldSchema.ts` |
| 2 Entscheidungs-Log | **drin** `decisions.ts`, Default `[]` |
| 3 KNOWLEDGE_META | **drin** |
| 4 Proben-Modifikator Nebel/Erschöpfung | **drin.** Summe = W10 + ST/GE/CH + Mod + Nebel. Erschöpfung einmal im Attribut. Wunde fällt bei LP 8. |
| 5 Ruf `rufAus` | **drin**, HUD + SL, kein Decay |
| 6 Erinnerung | **drin**, `synchronisiereLog` beim `present` |
| 7 Dead-Node + Lager-Checkliste | Fluss echt (`FLUSS`). Lager liest `LAGER_WEGE`, kein Stub |
| 8 Lager nach `content.ts` | Hub **und** vier Wege in `lager-content.ts`; Ablauf bleibt `script.ts` |
| 9 Wege | **drin** `seitentor`, `schleich_ablenkung`; `wissen_anfuehrer` / `banditen_geholfen` reserviert |
| 10 Export/Import JSON | **drin** Modul-Export + Spielstand-JSON (Titel: Standdatei). Zod prüft den Kern beim Laden. |
| 11 Orts-Module | teilweise: `seiten-zustaende.ts` |
| 12 Quest-Module extrahieren | Mühle, Brunnen, Gasse erledigt |
| 13 neue Quest-Typen | **nicht** — nur mit Questreihen-Skill |
| 14 Editor | **Weltwerkzeug** im Spiel. `/editor` merkt Auflagen ohne Partie |
| 15 Epilog aus Log | **drin**, Zusatzzeilen aus Ruf |

Inhalt, der **nicht** vor dem Fundament kommt: dritte Versorgungsquest, zweite Erinnerungsquest, Chargen-Objekte, SL-Ereignis. Die Specs dafür bleiben gültig (`QUESTREGISTER`, `SZENARIO_ALTER_GLOCKENWEG`).

---

## Einzelheiten aus dem Rohplan (vollständig)

### Entscheidung

```
szeneId: string
timestamp: number
typ: "ruf" | "wissen" | "npc" | "weg"
ziel: string
wert: number | string | boolean
```

`protokolliere(held, { szeneId, typ, ziel, wert })` hängt an `held.entscheidungen`.

### HeldSchema

Datei `src/game/heldSchema.ts`. Nur Name, ST, GE, CH, LP, `entscheidungen` streng. Rest bleibt lose in `isHeld()`. Kein Big-Bang von `types.ts` auf Zod.

`createHeld()` setzt `entscheidungen: []`. Alte Saves laden leer.

### Ruf

`rufAus(held, ziel)`: Summe der Log-Einträge `typ=ruf` für `ziel`, clamp −100…100.  
`aendereRuf(held, szeneId, ziel, delta)` nur über `protokolliere`.

### Erinnerung

`merkeDir(held, szeneId, npcId, flagId)` → typ `npc`.  
`erinnertSich(held, npcId, flagId)` liest das Log. Alte Booleans bleiben parallel, bis eine Szene bewusst umgestellt wird.

### Wissen-Meta

`KNOWLEDGE_META: Record<KnowledgeKey, { typ, label }>`  
Typen: `material | sozial | ort | übernatürlich`.  
`deriveKnowledge()` unangetastet.

### Probe

`situationsModifikator`: Nebel −2, Erschöpfung −3 wenn Effekt liegt. **Immer vor** `probe()`, nie danach.

### Sicherheitsnetz vor Lager

`findDeadNodes`. Checkliste `docs/regression-checklist.md`: Kampf, Schleichen, Verhandlung, Seitentor — je erwartetes Ende. Pflicht vor Schritt 8.

### Lager-Extraktion

Ein Weg nach dem anderen nach `content.ts`-Muster. Danach erst `Loesungsweg` um `seitentor | schleich_ablenkung | wissen_anfuehrer | banditen_geholfen` erweitern.

### Export

Pro Modul eine JSON-Datei. Zod-parse **vor** Schreiben. Nur extrahierte Module.

### Fehlerquellen

- Log wächst; bei endlicher Szenenzahl egal, im Auge behalten.
- Zwei (jetzt drei) Zustandmuster — dieses Blatt und `AGENTS.project.md`.
- Schritt 8 ohne Schritt 7 ist der riskanteste Punkt.
- `isHeld()` bleibt grob.
- Export vor Extraktion liefert Rohcode.

---

## Reihenfolge (verbindlich)

| Block | Schritte | Darf parallel |
|---|---|---|
| **A Fundament** | 1 Schema + 2 Log. Sonst nichts. | — |
| **B Views** | 5 Ruf, 6 Erinnerung, 3 Meta | 4 Nebel-Modifikator |
| **C Netz** | 7 Dead-Node + Checkliste | Orts-Zustände pflegen (11) |
| **D Risiko** | 8 Lager extrahieren, ein Weg pro Block | — |
| **E Danach** | 9 Wege, 10 Export, 12 Rest-Module, 14 Editor, 15 Epilog | 13 neue Quest-Typen nur mit Questreihen-Skill |

Neue Erzähl-Quests (Glockenweg-Feinschliff, dritte Versorgung, zweite Erinnerung) erst **nach Block A**, besser nach B, und nie gemischt mit Block D.

---

## Nächster Arbeitsschritt

Fundament sitzt. Als Nächstes: restliche Lager-Wege nach `lager-content.ts` (ein Weg pro Block, Checkliste abhaken) oder Inhalt (Glockenweg) — nicht beides gemischt.

---

## Dokumente

| Datei | Rolle |
|---|---|
| `docs/ERNEUERUNGSPLAN.md` | **Diese** technische Reihenfolge |
| `docs/QUESTREGISTER.md` | Namen, Flags, Labels — vor jeder Quest |
| `docs/HANDOFF.md` | Sitzungsblatt |
| `docs/WISSEN_FREISCHALTUNGSPLAN.md` | Wann eine Option erscheinen darf |
| `.grok/skills/lindendorf-questreihe/` | Quest bauen |
| `docs/SZENARIO_ALTER_GLOCKENWEG.md` | Inhalt Glockenweg, nicht die Reihenfolge |
| `docs/ERZAEHLREVISION_DARKFANTASY.md` | Stimme und Bogen, nicht die Reihenfolge |
| `docs/lindendorf-erweiterung-plan.md` | Rohfassung, nicht mehr führen |
| `docs/VORPLANUNG_VIER_PHASEN.md` | historisch, Phasen 1–3 weitgehend erledigt |
