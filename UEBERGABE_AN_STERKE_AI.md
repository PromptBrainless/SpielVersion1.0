# Übergabe an eine weitere KI — Lindendorf

Nicht neu anfangen. Technische Reihenfolge: `docs/ERNEUERUNGSPLAN.md`.  
Kanon: `docs/QUESTREGISTER.md`. Sitzung: `docs/HANDOFF.md`.

Deutsch, Du, Präsens. Schön, hart, düster.

Grundfluss: Heldenerstellung → Prolog → Dorf-Schleife → Glockenweg/Wald → Banditenlager → Ende.

- `script.ts` Hauptfluss, Lager-Ablauf, Dorf-Hub
- `quest-*.ts` Nebenquests
- `json/baum.ts` Kanon-Texte und Porträts
- `src/components/welt/` Weltwerkzeug
- `src/game/gm/` Heldensicht / GmCommand
- `save.ts` Namensslots, Autosave, JSON-Import
