# Lindendorf — Projekthinweise

Technische Reihenfolge: `docs/ERNEUERUNGSPLAN.md`.
Sitzung: `docs/HANDOFF.md`.
Namen/Flags: `docs/QUESTREGISTER.md`.

Nebenquests: `.grok/skills/lindendorf-questreihe/SKILL.md`, Prompt
`docs/PROMPT_QUESTREIHE.md`. Eine Quest pro Block.

Git: nur `PromptBrainless/SpielVersion1.0`. Remote `origin`. Keine Spiegel.

## Drei Zustandmuster

1. Booleans/Enums am Held (`sannaGeholfen`) — bestehende Quests.
2. `held.effekte` — Gunst/Last, Probe vor `probe()`.
3. `held.entscheidungen` — Log. Ruf über `rufAus()`, kein extra Feld, kein Decay.

## Stimme

Deutsch, Du, Präsens. Schön, hart, düster. Vorbild `quest-muehle.ts`.
Danach: `npm run typecheck && npm run check:knowledge && npm run check:questreihe`.

## Nicht ohne Auftrag

Engine, Runtime, Auth, DB, Haupt-Endtitel, Zod-Vollumbau von `types.ts`,
neue ArtKeys. Grundfluss Heldenerstellung → Dorf → Glockenweg/Wald → Lager → Ende.
