# Lindendorf

**Lindendorf** ist ein illustriertes, browserbasiertes Dark-Fantasy-Textabenteuer. Ein gewöhnlicher Mensch erreicht ein armes Tal, dessen Vorräte verschwinden, dessen Glocke für die falschen Leute läutet und dessen alter Steinbruch wieder bewohnt ist.

Aktueller Ausbau: [`docs/ERNEUERUNGSPLAN.md`](docs/ERNEUERUNGSPLAN.md). Register: [`docs/QUESTREGISTER.md`](docs/QUESTREGISTER.md). Repo: [SpielVersion1.0](https://github.com/PromptBrainless/SpielVersion1.0).


Das Spiel verbindet ausführliche deutsche Erzähltexte mit drei Attributen, W10-Proben, wissensbasierten Freischaltungen, Nebenquests, mehreren Lösungswegen und unterschiedlichen Enden. Entscheidungen verändern spätere Szenen und den Epilog.

## Spielumfang

Der aktuelle Stand enthält Heldenerstellung, einen bebilderten Prolog mit erster Würfelentscheidung, eine offene Dorf-Schleife, Rathaus, Taverne, Brunnen, Mühle, Schmiede, Apotheke, mehrere Nebenquests, den alten Glockenweg, Wald und Banditenlager. Das Lager kann durch Kampf, Schleichen, Verhandlung oder das Seitentor gelöst werden.

Sechs neue Hintergründe und vier neue Figurenporträts ergänzen die bestehende dunkle Low-Fantasy-Ölmalerei. Die Oberfläche ist für Desktop und Mobilgeräte ausgelegt. Ein Spielstand kann lokal im Browser gespeichert und am Dorfplatz fortgesetzt werden.

Eine Systemsteuerung (Taste `E`) regelt Ton, Bild, Text, Spielverhalten und Spielstände. Der Ton entsteht vollständig im Browser: Wind, Wasser, Feuer, Hammerschlag und Stimmengemurmel folgen dem Szenenbild, die Tageszeit färbt sie. Es wird keine Audiodatei geladen. Einzelheiten: [`docs/SYSTEMSTEUERUNG_UND_TON.md`](docs/SYSTEMSTEUERUNG_UND_TON.md).

## Technik

- React und TypeScript
- Vite/Nitro-Build
- Tailwind-basierte Oberfläche
- Zod-validierte Inhaltsstruktur
- prozeduraler Ton über die Web Audio API, ohne Audioarchiv
- lokaler Browser-Spielstand und lokale Einstellungen
- deterministische Wissens- und Assetprüfungen

## Lokal starten

```bash
npm install
npm run dev
```

Die Entwicklungsseite läuft standardmäßig auf `http://localhost:8080`.

## Prüfen

```bash
npm run typecheck
npm run check:knowledge
npm run build:dev
npm test
```

Gegen einen laufenden `npm run dev` prüft `npm run check:system` die
Systemsteuerung, die Tastenwege, die Haftung des HUD beim Scrollen und den
Querlauf bei 390 Pixeln.

Zusätzlich prüft das projektweite QA-Skript außerhalb dieses Repository-Unterordners Held-Felder, Bildschlüssel, Porträtschlüssel, Assets und aktuelle Quests. `scripts/check-darkfantasy-mobile.mjs` führt einen mobilen Smoke-Test mit Playwright und einem lokal vorhandenen Chromium aus. Der ausführbare Browserpfad ist derzeit `/usr/bin/chromium` und kann bei Bedarf im Skript angepasst werden.

## Wichtige Dateien

| Pfad | Zweck |
|---|---|
| `src/game/script.ts` | Gesamter Szenenfluss, Proben, Quests und Enden |
| `src/game/content.ts` | Zod-validierter Pilot für datengetriebene Szeneninhalte |
| `src/game/knowledge.ts` | Ableitung des Spielerwissens aus Held-Zuständen |
| `src/game/types.ts` | Held-, Bild- und Szenentypen |
| `src/game/art.ts` | Zuordnung aller Hintergründe und Porträts |
| `src/game/save.ts` | lokaler Speicherstand |
| `src/game/einstellungen.ts` | Systemsteuerung: Ton, Darstellung, Spielverhalten |
| `src/game/klang.ts` | prozedurales Klangwerk (Orte und Rückmeldungen) |
| `src/components/game/Systemsteuerung.tsx` | Bedienfeld der Einstellungen |
| `public/art/` | Spielhintergründe und Figurenporträts |
| `docs/PROJEKTKONTEXT.md` | aktueller Projektstand und nächste sichere Schritte |
| `UEBERGABE_AN_STERKE_AI.md` | kompakte Übergabe für eine weitere KI |

## Erzählprinzipien

Die Welt bleibt materiell glaubwürdig: Getreide, Salz, Eisen, Verbandstoff, Kohle und trockene Schlafplätze sind wichtiger als abstrakte Lore. Das Übernatürliche bleibt selten und mehrdeutig. Figuren haben eigene Bedürfnisse und erinnern sich an Entscheidungen. Wissen wird erst sichtbar, wenn der Spieler es tatsächlich erworben hat.

## Status

Der aktuelle Stand ist technisch gebaut und auf Desktop sowie bei 390 × 844 Pixeln mobil geprüft. Systemsteuerung und Ton sind ergänzt, die Bedienleiste haftet beim Scrollen wieder oben. Die Dark-Fantasy-Revision und die neue Bildrunde bilden die Grundlage für weitere Inhalte, zusätzliche Pfadtests und Balancing.
