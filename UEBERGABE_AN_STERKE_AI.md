# Übergabe an eine weitere KI — Lindendorf

## Auftrag

Spielbares, illustriertes React/TypeScript-Textabenteuer. Nicht neu anfangen.
Technische Reihenfolge: `docs/ERNEUERUNGSPLAN.md`.
Kanon: `docs/QUESTREGISTER.md`. Sitzung: `docs/HANDOFF.md`.

## Stimme

Deutsch, Du, Präsens. Schön, hart, düster. Keine Auserwählten-Rhetorik, keine High-Fantasy, kein Verwaltungs- oder Therapievokabular.

## Grundfluss

Heldenerstellung → Prolog → Dorf-Schleife → Glockenweg/Wald → Banditenlager → Ende.

ST/GE/CH 10/10/10 plus Effekte. W10. 10 LP. Save merged mit `createHeld()`.

## Architektur (Ist)

- `script.ts` Hauptfluss, Lager, Dorf-Hub
- `quest-muehle.ts` / `quest-brunnen.ts` / `quest-kesseljahr.ts` Nebenquests
- `content.ts` nur Intro-Pilot
- `knowledge.ts` Journal aus Flags
- `effekte.ts` / `seiten-zustaende.ts` Gunst/Last
- `save.ts` localStorage
- nächster Code: `heldSchema.ts`, `decisions.ts` (noch nicht)

## Nächste Arbeit

Nur Block A: Zod-Partial für den Held + `entscheidungen: []`.
Kein Lager-Refactor ohne Dead-Node-Checkliste.
Keine neue Quest in dem Block.

## Verbote

Kein Framework-Tausch. Keine Quest löschen. Kein Wissen vor seiner Quelle.
Kein Ruf-Feld am Held. Kein Zod-Big-Bang von ganz `types.ts`.

## Repos

[SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0) — die einzige Repo. Keine Spiegel.
