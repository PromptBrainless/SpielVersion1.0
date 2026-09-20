# Übergabe — 20. September 2026

Frisch starten: `docs/ERNEUERUNGSPLAN.md`, dann dieses Blatt, dann
`docs/QUESTREGISTER.md`. Bei Questbau zusätzlich
`.grok/skills/lindendorf-questreihe/SKILL.md`. Code gewinnt bei Streit.

## Was im Spiel liegt

Drei Nebenquests. Hauptfluss unberührt. SL, 18 Zustände, Lagen, HUD oben aufklappbar, Bildstreifen ohne Text darüber.

| Quest | Einstieg | Modul | Status |
|---|---|---|---|
| Die Schuld der Mühle | `Zur Mühle gehen` | `quest-muehle.ts` | Goldstandard |
| Das trübe Wasser | `Den trüben Eimer prüfen` | `quest-brunnen.ts` | spielbar |
| Das Kesseljahr | `Zur Gerbereigasse gehen` | `quest-kesseljahr.ts` | spielbar |

Echo: `src/game/reihe-versorgung.ts`. **Nur eine Repo:** [SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0).

## Stimme

Deutsch. Du. Präsens. Schön, hart, düster. Vorbild `quest-muehle.ts`.
Nicht Telegramm, nicht Barock, keine wollenden Häuser.

## Nächster Schritt

Werkstatt: `/editor` (Titel → Werkstatt). Fluss, Proben, Wissen, Questpfade ohne Spielstart.


Nicht ohne Auftrag: Engine, Auth, Haupt-Endtitel, neue ArtKeys, Zod-Big-Bang von `types.ts`.
