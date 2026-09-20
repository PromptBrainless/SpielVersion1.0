# Welteditor — Ist-Stand

Eine Fläche: HUD **Welt** während der Partie, `/editor` ohne Partie (Fach Prüfen).
Kein Monaco. Kein Zustand. Kein zweites Runtime.

## Was wirklich prüft

| Werkzeug | Datei | Ernst? |
|---|---|---|
| Fluss-Tote / unbekannte Kanten | `editor-fluss.ts` | Ja, aber nur gegen den **Übersichtsgraph** `FLUSS`, nicht gegen `script.ts` |
| Lager-Tote | `testTools.ts` `lagerToteKnoten()` | Ja — IDs aus `LAGER_CONTENT` / `LAGER_WEGE`. Extra-Weg ohne Hub-Wahl gilt als tot |
| Questpfade | `editor-quests.ts` `probePfad` | Ja, nur die gelisteten Kombinationen |
| Bilder | `editor-assets.ts` | Ja, HEAD auf ART/PORTRAITS |
| HUD | `scripts/check-hud-welt.mjs` | Ja, Desktop + Handy |
| Mobile-Smoke | `scripts/check-darkfantasy-mobile.mjs` | Ja, aber nur Prolog + Fremder |
| Export | `export-modul.ts` | Intro, Lager, Lager-Wege |
| Import | `importiereModul` | Zod-Prüfung, **schreibt nicht in den Kanon** |
| Monaco | Fach Prüfen, lazy | JSON für Auflage/Intro/Lager. Prüfen merkt nur Auflage |

## Bewusst nicht

Zustand, Jotai. Szenen-Hot-Reload extra. Automatische Enumeration aller Questpfade. Der Prüfgraph ist keine Kopie von `script.ts`. Monaco nicht in den Spieltexten, nur JSON.
