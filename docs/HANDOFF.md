# Übergabe — 20. September 2026, Abend

Neues Fenster: zuerst `docs/KONTEXT_NEUES_FENSTER.md`.

**Auftrag:** Welteditor neu unter `src/components/welt/`. Nicht alten SL-/Werkstatt-Code erweitern.

Frisch starten sonst: `docs/ERNEUERUNGSPLAN.md`, `docs/QUESTREGISTER.md`.

## Was im Spiel liegt

Drei Nebenquests. Hauptfluss unberührt. 18 Zustände, Lagen, HUD oben. Welt-Speicher `welt.v2` und Szenen-Ids an den Hubs sitzen.

| Quest | Einstieg | Modul | Status |
|---|---|---|---|
| Die Schuld der Mühle | `Zur Mühle gehen` | `quest-muehle.ts` | Goldstandard |
| Das trübe Wasser | `Den trüben Eimer prüfen` | `quest-brunnen.ts` | spielbar |
| Das Kesseljahr | `Zur Gerbereigasse gehen` | `quest-kesseljahr.ts` | spielbar |

Repo: nur [SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0).

## Stimme

Deutsch. Du. Präsens. Schön, hart, düster. Vorbild `quest-muehle.ts`.

## Nächster Schritt

Welteditor **neu einbauen** — alle Funktionen aus `docs/KONTEXT_NEUES_FENSTER.md`. Alte Dateien `SpielleiterPanel.tsx`, `Weltwerkzeug.tsx`, `EditorApp.tsx` nicht als Grundlage.

Nicht ohne Auftrag: Engine, Auth, Haupt-Endtitel, neue ArtKeys, Zod-Big-Bang von `types.ts`.
