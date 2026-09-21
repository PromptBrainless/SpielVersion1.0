# Übergabe — 21. September 2026

Neues Fenster: `docs/ERNEUERUNGSPLAN.md`, dann `AGENTS.project.md`.

Repo: nur [SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0).

## Ist

Weltwerkzeug im Spiel (HUD **Welt**, Alt+S). Vier Fächer: Karte, Held, Stimme, Prüfen.  
GameState → Mapper → Heldensicht. Probe: `W10 + ST/GE/CH + Mod + Nebel`.  
Gunst / Last / Lage getrennt. Sprechende Figuren haben Porträt.  
Namensslot in localStorage, Autosave nach 500 ms, JSON-Import auf dem Titel.

| Quest | Einstieg | Modul |
|---|---|---|
| Die Schuld der Mühle | Zur Mühle gehen | `quest-muehle.ts` |
| Das trübe Wasser | Brunnen | `quest-brunnen.ts` |
| Das Kesseljahr | Gerbereigasse | `quest-kesseljahr.ts` |

Hauptfluss und Lager: `script.ts` + `lager-content.ts`. Kanon-Texte: `json/baum.ts`.

## Stimme

Deutsch. Du. Präsens. Schön, hart, düster. Vorbild `quest-muehle.ts`.

## Nicht ohne Auftrag

Engine-Tausch, Auth, DB, Haupt-Endtitel, Zod-Vollumbau von `types.ts`, neue ArtKeys.
