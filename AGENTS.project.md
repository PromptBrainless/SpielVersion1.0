# Lindendorf — Projekthinweise

Technische Reihenfolge: `docs/ERNEUERUNGSPLAN.md`.
Sitzung: `docs/HANDOFF.md`.
Namen/Flags: `docs/QUESTREGISTER.md`.

Nebenquests: `.grok/skills/lindendorf-questreihe/SKILL.md`, Prompt
`docs/PROMPT_QUESTREIHE.md`. Eine Quest pro Block, nicht während Lager-Extraktion.

Git: nur `PromptBrainless/SpielVersion1.0`. Remote `origin`. Keine Spiegel.

## Drei Zustandmuster

1. Booleans/Enums am Held (`sannaGeholfen`) — bestehende Quests.
2. `held.effekte` — Gunst/Last, Probe vor `probe()`.
3. `held.entscheidungen` — Log für Ruf und Erinnerung. Noch nicht verdrahtet.
   Ruf nicht als Feld speichern. `rufAus()` über das Log, kein Decay.

## Stimme

Deutsch, Du, Präsens. Schön, hart, düster. Vorbild `quest-muehle.ts`.
OpenCode nur `lines`/Dialoge, dann Diff +
`npm run typecheck && npm run check:knowledge && npm run check:questreihe`.

## Nicht ohne Auftrag

Engine, Runtime, Auth, DB, Haupt-Endtitel, Zod-Vollumbau von `types.ts`,
neue ArtKeys, Lager-Refactor vor Dead-Node-Checkliste.
Grundfluss Heldenerstellung → Dorf → Glockenweg/Wald → Lager → Ende.
