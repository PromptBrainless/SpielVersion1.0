# Verdrahtung — wie eine Quest ins laufende Spiel kommt

Muster: `src/game/quest-muehle.ts` + die vier Zeilen in `script.ts`, die sie
aufrufen. Kein neues Framework. Kein Umzug der Geschichte nach `content.ts`.

## 1. Modul

`src/game/quest-<slug>.ts`

```ts
import { goldPlus, probe, schaden } from "./engine";
import { vielleichtHeiltrank } from "./heal";
import type { Runtime } from "./runtime";
import { LEICHT, MITTEL, SCHWER, tot, type Held } from "./types";

export async function dorf<Name>(rt: Runtime, held: Held) {
  if (held.loesungsweg<Name>) {
    await nachspiel(rt, held);
    return;
  }
  // Ankunft nur beim ersten echten Besuch, falls ein Besuchs-Flag existiert
  while (!tot(held) && !held.loesungsweg<Name>) {
    const items: { id: string; label: string }[] = [
      /* Stationen, Labels dürfen von Flags abhängen */
    ];
    items.push({ id: "dorf", label: "Zurück …" });
    const wahl = await rt.present({ /* … */ choices: items.map((i) => i.label) });
    const id = items[wahl]?.id;
    if (id === "dorf" || id == null) return;
    // dispatch nach id, nicht nach Index
  }
}
```

Pflicht im Modul:

- Hub-Schleife über `{ id, label }[]`, nie `choices[0] ===` auf festem Index.
- Nachspiel, sobald `loesungsweg*` gesetzt ist.
- `portrait: null` am Ortswechsel. Porträt nur, wenn jemand in der Karte spricht.
- Nach `schaden`: `held.todesort = tot(held) ? "<ort>" : held.todesort;` dann `present`, dann `if (tot(held)) return;`, dann `vielleichtHeiltrank`, dann nochmal `tot`.
- Charisma-Lösungsweg erst, wenn das Beweis-Flag steht.
- Schleich-Lösungsweg erst bei stiller Ankunft **oder** gefundenem Spur-Flag.

## 2. Typen

In `src/game/types.ts`:

```ts
export type <Name>Weg = "kampf" | "schleich" | "verhandelt" | "verraten" | null;
// Todesort-Union erweitern, nicht ersetzen
export type Todesort = "steg" | "rennik" | "zisterne" | "<neu>" | null;
```

Jedes neue Feld:

1. auf `Held`
2. in `createHeld` mit Default (`false`, `0`, `null`)
3. nirgends sonst Default erfinden — `save.ts` merget über `createHeld`

Alte Saves ohne das Feld bleiben spielbar.

## 3. Wissen

`src/game/knowledge.ts`:

- Key in `KnowledgeKey`
- Bedingung in `deriveKnowledge` aus **Held-Flags**, nicht aus freiem Text
- Ein Satz unter `sicher`, ein Satz unter `offen` (die offene Frage, solange ungelöst)

Journal spricht Tatsachen, keine Wertung.

## 4. Dorf-Hub (Label, nie Index)

`szeneDorf` baut `dorfChoices` als String-Array und dispatcht mit
`gewaehlt === "…"`.

Neue Top-Level-Quest: Label in das Array **einfügen**, Vergleichszweig
dazuschreiben. Bestehende Strings nicht umbenennen.

Quest unter einem bestehenden Ort (wie Wasser unter dem Platz): Label in
dessen lokale `choices`, denselben String im `if`.

Nach gelöster Quest das Label wandeln (`Den Brunnen noch einmal ansehen`),
nicht die Option löschen — Nachspiel muss erreichbar bleiben.

## 5. Import

```ts
import { dorf<Name> } from "./quest-<slug>";
```

Nur in `script.ts`. Module importieren einander nicht, außer eine bestehende
Figur-Funktion wird bewusst geteilt (`kernWasser` aus dem Brunnen-Modul).

`vielleichtHeiltrank` nur aus `./heal`. Die Kopie in `script.ts` nicht
vergrößern.

## 6. Rückbindungen in `script.ts`

Mindestens:

| Stelle | Was |
|---|---|
| Dorf-Ankunft | ein Satz, wenn gelöst / wenn ungelöst sichtbar |
| `Was du weißt` | ein Satz |
| eine Figur (Holm oder Mara) | Ton ändert sich |
| `szeneWald` Ankunft | ein Satz |
| `epilog(held)` | ein Satz **pro** Lösungsweg |
| Todesszene | wenn `todesort === "<neu>"` |
| Reputation/Erinnerung | `aendereRuf(held, szeneId, ziel, delta)` oder `merkeDir(held, szeneId, npcId, flagId)` **pro Lösungsweg**, wo die Quest Vertrauen oder Misstrauen erzeugt. Eintrag in `taten.ts` ( TATEN-Liste ), nicht am Held vorbei Zahlen setzen. `synchronisiereLog` läuft bei jedem `present`. |

Bestehende Endtitel der Hauptgeschichte nicht anfassen. Epilog-Bits sind
Zusatzzeilen, keine neuen `ending:`-Strings.

## 7. Knowledge-Gate-Checker

`scripts/check-knowledge-gates.mjs`:

- neue Keys in `requiredKnowledge`
- der **exakte** Einstiegs-Label-String in `requiredHooks`
- Datei wird über `src/game/quest-*.ts` mitgelesen (nicht nur `script.ts`)

## 8. Was nicht verdrahtet wird

- Kein neues Save-Schema (`lindendorf-save-v1` bleibt).
- Kein Item außer Heiltrank/Schlüssel/Gold.
- Keine zweite Probe-Hilfe, keine Crits, keine Modifikatoren außer
  `verwundet ? SCHWER : MITTEL` und Vorwarnung.
- `content.ts` nicht für die Quest missbrauchen; Zod bleibt Intro-Pilot.

## 9. Reihenfolge der Patches

1. `types.ts` (Flags + Union + createHeld)
2. `quest-<slug>.ts` (Modul kompiliert gegen die Flags)
3. `knowledge.ts`
4. `script.ts` (Import, Label, Echo, Epilog, Tod)
5. `taten.ts` (merkeDir / aendereRuf pro Lösungsweg)
6. `check-knowledge-gates.mjs`
7. `docs/QUESTREGISTER.md` + `docs/quests/<slug>.md`
