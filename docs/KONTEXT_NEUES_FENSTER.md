# Kontext — neues Fenster

**Datum:** 20. September 2026, Abend  
**Repo:** nur [PromptBrainless/SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0) (`origin`). Keine Spiegel.  
**Auftrag für die nächste Sitzung:** Welteditor **neu** bauen. Nicht `SpielleiterPanel`, nicht `Weltwerkzeug.tsx`, nicht `EditorApp` erweitern. Spiel-Engine bleibt.

---

## Spiel

Lindendorf. Dark-Fantasy-Textabenteuer. Deutsch, Du, Präsens. Hart, düster. Vorbild `quest-muehle.ts`.

Fluss: Heldenerstellung → Prolog → Dorf-Schleife → Glockenweg/Wald → Lager → Ende.

Quests: Mühle (Goldstandard), Brunnen, Kesseljahr. Hauptfluss in `script.ts`. Lager-Texte in `lager-content.ts`.

Drei Zustandmuster: Booleans am Held, `held.effekte`, `held.entscheidungen` (Ruf/Erinnerung als Views, kein extra Zahlenfeld).

Startwerte 10/10/10. W10. HUD oben, aufklappbar. Bilder nicht unter Text.

Technische Reihenfolge: `docs/ERNEUERUNGSPLAN.md`. Stimme und Verbote: `AGENTS.project.md`.

---

## Auftrag Welteditor — neu, nicht auf altem Code

Eine Schublade **während des Spiels**. HUD-Knopf **Welt**. `Alt+S` / `Esc`. Mobil Bottom-Sheet, Safe-Area.

Altes, das **nicht** als Basis dienen darf:

- `src/components/game/SpielleiterPanel.tsx`
- `src/components/editor/Weltwerkzeug.tsx`
- `src/components/editor/EditorApp.tsx` (nur die Oberfläche; Prüf-Daten in `editor-fluss.ts` / `editor-quests.ts` dürfen gelesen werden)
- `text-pack.ts` als Speicherweg für neue Änderungen
- Doppel-Schreiben in zwei localStorage-Keys

Was **bleiben** darf (Spiel, nicht UI):

- `src/game/welt.ts` — `lindendorf.welt.v2`, Auflage, Undo eine Stufe, Migration der Alt-Keys einmal
- `probe()`, `deriveKnowledge`, `KNOWLEDGE_META`, `rufAus` / `aendereRuf`, `setzeEffekt`, `herkunft`, `sl-upload`
- `present({ id })` und `SceneView.id` (Hubs: intro, dorf, glockenweg, wald, lager-*)

Neuer Ort: `src/components/welt/` (Editor, Karte, Held, Prüfen). SceneStage/HUD nur verdrahten.

---

## Pflichtfunktionen (alle)

### Karte
Titel, Text, Wahlen (Anzahl fest). Bild/Portrait inkl. Upload. Zustände geben/nehmen. Diff Kanon vs Auflage. Rückgängig eine Stufe. Auf Kanon. Badge gemerkt. Ohne `id`: Hinweis brüchig.

Speichert **Auflage** (`welt.v2`), nicht den Held, nicht den Quelltext.

### Held
Gunst/Last auf den lebendigen Held → Partie (`save` bleibt HUD-Speichern). Lage vorlegen. Ruf nur Anzeige über `rufAus`. Wissen gruppiert nach `KNOWLEDGE_META`-Typ. Erinnerung: `typ=npc` pro Figur. Probe standardmäßig ohne Schreibzugriff auf die Partie.

Ohne Partie: Banner **nicht die Partie**, Warnfarbe.

### Prüfen
Tote Knoten, Questpfade ohne Durchspielen, Bildschlüssel. Kanon-Schreiben nur nach Bestätigung + zeilengenauem Diff. Kein Git. Kein zweites Playwright.

### HUD
`Wissen (n)`. `Welt ● n` nur bei Abweichung der aktuellen Karte; Zahl = alle Auflagen. Ohne Abweichung nur „Welt“.

### Titel
Ein Einstieg **Weltwerkzeug**. Kein Extra-Textmodus. Inline-Stifte nur bei offener Schublade.

### Drei Speicher, nie mischen
1. Partie — `lindendorf-save-v1`  
2. Auflage — `lindendorf.welt.v2`  
3. Kanon — Quelltext, nur nach Bestätigung  

---

## Nicht bauen
Wahl-Anzahl, Verzweigungen, Quest-Flags umbauen. Log von Hand fälschen. Neue ArtKeys ohne Bildplan. Ereignis/Wetter. Monaco/Zustand. Zwei Runtimes. Voller Undo-Stack.

---

## Lesen nach dem Öffnen
1. Dieses Blatt  
2. `docs/WELTWERKZEUG.md` (Zielbild, Funktionen)  
3. `docs/HANDOFF.md`  
4. `docs/ERNEUERUNGSPLAN.md`  
5. Code: `src/game/welt.ts`, `src/game/script.ts` (present-ids), `src/components/game/Hud.tsx`
