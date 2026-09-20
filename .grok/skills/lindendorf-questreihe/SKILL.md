---
name: lindendorf-questreihe
description: >
  Qualitativ hohe Nebenquest-Reihen für Lindendorf schreiben und verdrahten.
  Pflicht vor jeder neuen Quest, Questreihe, Nebenhandlung, Steckbrief,
  Abenteuer-Ausbau, Mühle/Brunnen-Nachfolger oder „große Quest“.
  Triggers: quest, questreihe, nebenquest, nebenhandlung, steckbrief,
  abenteuer, "neue quest", "große quest", sidequest, mill, mühle, brunnen,
  lindendorf quest, "quest schreiben", "quest einbauen".
metadata:
  short-description: "Lindendorf-Questreihen: Kanon, Steckbrief, Verdrahtung, Qualität"
user-invocable: true
---

# Lindendorf-Questreihe

Schreibe **keine neue Engine und kein neues Kapitel**. Schreibe eine
spielbare Nebenquest-Reihe **in der Dorf-Schleife**.

Technischer Ausbau (Schema, Log, Lager): `docs/ERNEUERUNGSPLAN.md`.
Während Block A und während der Lager-Extraktion keine neue Quest.


Goldstandard (lesen, nicht kopieren):

- Spec: `attachments/quest-die-schuld-der-muehle.md`, `attachments/quest-das-truebe-wasser.md`
- Code: `src/game/quest-muehle.ts`, `src/game/quest-brunnen.ts`
- Stimme: `attachments/how_to_be_a_hero_v01.py`
- Regeln: `docs/AUTORENHANDBUCH_TEXTABENTEUER.md`, `docs/ANWEISUNGEN_MANUS.md`
- Wissen: `docs/WISSEN_FREISCHALTUNGSPLAN.md`

**Referenzen (pflichtweise, in dieser Reihenfolge):**

1. `references/kanon.md` — belegte Namen, Flags, Bilder, Einstiege
2. `references/reihe.md` — Serie aus 3–5 Quests, nicht eine isolierte Perle
3. `references/steckbrief.md` — Spec vor dem ersten `present()`
4. `references/wiring.md` — TypeScript-Vertrag, Hub-Labels, Save-Merge
5. `references/qualitaet.md` — Stimme, Gates, Durchlauf, Automatismen

Nutzer-Prompt zum Einfügen: `docs/PROMPT_QUESTREIHE.md`.
Lebendes Register: `docs/QUESTREGISTER.md` — nach jeder Quest aktualisieren.

---

## Automatismus (nicht überspringen)

Sieben Phasen. Eine Phase auslassen = die Quest ist nicht fertig.

| Phase | Ergebnis, bevor die nächste beginnt |
|---|---|
| **0 Kanon** | Belegte Namen/Flags/Bilder/Einstiege gelesen. Kollisionsliste notiert. |
| **1 Reihe** | 3–5 Quests, eine gemeinsame Schuld, jede unabhängig spielbar. |
| **2 Steckbrief** | Eine Quest vollständig spezifiziert (Matrixen + 4 Ausgänge). |
| **3 Kollision** | Kein Namensdiebstahl, kein Flag-Diebstahl, kein Index-Dispatch. |
| **4 Modul** | `src/game/quest-<slug>.ts` im Mühle-Muster. |
| **5 Draht** | `types`, `createHeld`, `knowledge`, Hub-Label, Wald, Epilog, Tod, Checker, **Ruf/Erinnerung in `taten.ts`**. |
| **6 Qualität** | `typecheck`, `check:knowledge`, `check:questreihe`, ein Erfolg- und ein Misserfolg-Pfad. |

Implementiere **eine Quest pro Arbeitsblock**. Eine Reihe wird nicht in einem
Zug als Wand aus Szenen geliefert.

---

## Unveränderlich

```text
Heldenerstellung → Prolog → Dorf-Schleife → Glockenweg/Wald → Lager → Ende
```

- Deutsch, Du, Präsens. Deutsche Anführungszeichen `„…“`.
- Attribute nur Stärke / Geschicklichkeit / Charisma. W10. LEICHT 8 / MITTEL 12 / SCHWER 15.
- Inventar nur Heiltrank, Schlüssel, Gold.
- Haupt-Endtitel nicht umbenennen.
- Engine, Runtime, Auth, DB, UI-Chrome, Palette nicht anfassen.
- Neue Option nur nach erworbenem Wissen (`WISSEN_FREISCHALTUNGSPLAN.md`).
- Hub **immer nach Label** dispatchen, nie nach Zahlenindex.
- Neues Flag: echte Entscheidung, **mindestens zweimal gelesen**, kein Alias eines vorhandenen Flags.
- Neue Bilder nur nach `docs/BILDPLAN_DARKFANTASY.md`. Sonst vorhandene ArtKeys wiederverwenden.
- `held` mutieren, **dann** `present({ held })`. Nach Schaden: `if (tot(held)) return;`.
- Heilung: `import { vielleichtHeiltrank } from "./heal"` — nicht in `script.ts` duplizieren.

---

## Was „große Reihe“ hier heißt

Nicht mehr Plot. Mehr **Erinnerung über mehrere Türen**.

Eine Reihe ist gut, wenn der Spieler nach drei Quests sagen kann:

> Ich weiß, wer im Tal wartet, was ich wem schulde, und was es später gekostet hat.

Eine Reihe ist schlecht, wenn sie ein zweites Dorf, einen Drachen, neue Regeln
oder drei austauschbare Informanten braucht.

---

## Dateivertrag für eine Quest

| Datei | Pflicht |
|---|---|
| `docs/quests/<slug>.md` | Steckbrief, bleibt die narrative Quelle |
| `src/game/quest-<slug>.ts` | Spielbares Modul, exportiert die Hub-Funktion |
| `src/game/types.ts` | Flags + Lösungsweg-Union + `createHeld`-Defaults |
| `src/game/knowledge.ts` | Keys, `deriveKnowledge`, Journal-Sätze |
| `src/game/script.ts` | Import, **Label**-Einstieg, Wald-/Epilog-/Todes-Haken |
| `src/game/taten.ts` | Lösungsweg → `merkeDir` / `aendereRuf`, nie direkt Zahlen |
| `scripts/check-knowledge-gates.mjs` | Neue Keys und der Einstiegs-Label-String |
| `docs/QUESTREGISTER.md` | Namen, Flags, Label, Art, Haken |

Nicht ohne Auftrag: `engine.ts`, `runtime.ts`, `src/lib/**`, Router, PWA.

---

## Sofort-Verbot

- Namen aus dem Register wiederverwenden (`Sanna` ≠ Müllerin, `Kern` ≠ neue Heilerin).
- Spec-Namen ungeprüft übernehmen (Lehre: Spec sagte Senna/Mirl, Kanon hat Sanna/Kern).
- Numerische Dorf-Indizes. Eine eingefügte Option zerbricht sonst Holm/Taverne/Wald.
- Generische Flags (`spurenGefunden` gehört schon der Mühle).
- Englische Wahltexte, Emojis, Pathos, „In einer Welt“, „das Schicksal“.
- Quest, die den Wald/das Lager ersetzt oder den Auftrag erzwingt.
- Mehr als ein neuer Schauplatz pro Quest, und nur am Dorfrand.

---

## Fertig-Satz

Die Quest ist fertig, wenn:

1. sie aus dem Dorf erreichbar ist, ohne den Hauptfluss zu sperren;
2. alle drei Attribute einen eigenen Lösungsweg haben plus einen teuren vierten;
3. Misserfolg den Weg verändert, nicht nur den Satz;
4. Holm, Mara oder der Wald sich später an den Ausgang erinnern;
5. das Wissenstagebuch den Stand in einem Satz erklären kann;
6. `npm run typecheck && npm run check:knowledge && npm run check:questreihe` grün sind;
7. das Register aktualisiert ist.
