# Questregister — belegte Namen, Flags, Einstiege

Vor jeder neuen Quest lesen. Nach jeder gelandeten Quest **in derselben Sitzung**
ergänzen. Der Code in `src/game/types.ts` und `src/game/script.ts` gewinnt bei Streit.
Technische Reihenfolge des Ausbaus: `docs/ERNEUERUNGSPLAN.md`.


## Reihen

| Reihe | Schuld | Quests | Status |
|---|---|---|---|
| Versorgung des Tals | Das Dorf verliert, was es zum Leben braucht | Die Schuld der Mühle; Das trübe Wasser | zwei, abgeschlossen als Paar |
| Erinnerung des Tals | Was das Dorf lieber vergisst | Das Kesseljahr; Der ungerufene Name | zwei, spielbar |

## Quests

| Titel | Modul | Einstiegs-Label | Lösungsweg-Flag | Randort | Art |
|---|---|---|---|---|---|
| Die Schuld der Mühle | `quest-muehle.ts` `dorfMuehle` | `Zur Mühle gehen` | `loesungswegMuehle` | Lagerhaus am Fluss | mill, ditch, camp, evidence, sneak, combat, townhall |
| Das trübe Wasser | `quest-brunnen.ts` `dorfTruebesWasser` | `Den trüben Eimer prüfen` (unter Brunnen und Dorfplatz) | `loesungswegBrunnen` | Zisterne am Waldrand | well, apothecary, ditch, evidence, camp |
| Das Kesseljahr | `quest-kesseljahr.ts` `dorfGasse` | `Zur Gerbereigasse gehen` | `loesungswegGasse` | Kirchengewölbe | chapel, village, townhall, ditch, evidence, sneak |
| Der ungerufene Name | `quest-ungerufener-name.ts` (Haken in `script.ts`) | `Die Abflussrinne untersuchen` / letzter Knoten / Köhler | `ungerufenerNameGeloest` `fadenGeschlossen` | kein neuer Ort | village, townhall, well, chapel, forest, camp |

## Eigennamen

Holm, Mara, Kess, Lene (Müllerin, Porträt miller), Bertok, Yorwin, Rennik,
Witwe Kern (nicht Mirl), Dennek, Grovin, Sanna (nicht Senna), Jorren, Köhler,
Schmied (namenlos), Bettler am Brunnen (namenlos, Porträt beggar), Fenn (Kirche,
nicht der Brunnenbettler), Vahl, Grete, Ilse Brandtner (tot, nur Liste),
Junge mit der roten Schnur.

Historische Spec-Fallen: **Senna** → Lene, weil Sanna existiert. **Mirl** → Kern.

## Held-Flags der Nebenreihen

Mühle: `muehleBesucht`, `spurenGefunden`, `muellerVertraut`, `bertokBedraengt`,
`leneBedraengt`, `sennaBesuche`, `fluechtlingeEntdeckt`, `renniksBeweis`,
`rennikGewarnt`, `loesungswegMuehle`.

Brunnen: `truebungBestaetigt`, `spurAmBrunnen`, `dennekEntlarvt`, `grovinGenannt`,
`grovinsGrund`, `grovinGeflohen`, `grovinVersprechen`, `loesungswegBrunnen`.

Gasse: `gasseBesucht`, `fennGedraengt`, `gasseGeschichteGehoert`,
`gasseSpielzeugGefunden`, `gasseOrtGesehen`, `greteGespraech`, `greteBedraengt`,
`ilsesAufzeichnungenGefunden`, `vahlGrossvater`, `kuesterGewarnt`,
`vahlKonfrontiert`, `loesungswegGasse`.

Ungerufener Name: `fadenRinne`, `fadenMehlsackSpan`, `fadenBettlerSohn`,
`fadenMaraWarnung`, `fadenHolm`, `schnurLetzterKnoten`, `glockeNamenGelesen`,
`koehlerBefragt`, `fadenGeschlossen`, `ungerufenerNameGeloest`
(`erzwungen` \| `gefolgt` \| `anvertraut`).

Tod: `todesort` = `steg | rennik | zisterne | null`.

`spurenGefunden` ist vergeben (Mühle). Wald benutzt denselben Bezeichner nur lokal.

Schnittstelle der Reihe: `src/game/reihe-versorgung.ts`. Methode und Ausgang
einer Quest färben die andere, ohne sie zu sperren. Journal-Key `versorgung_muster`.

## Hub-Labels (nicht umbenennen)

`Mit dem Bürgermeister sprechen`, `Die Taverne besuchen`, `Brunnen und Dorfplatz`,
`Zur Mühle gehen`, `Zur Gerbereigasse gehen`, `Schmiede und Apotheke`, `Nach dem roten Wachs fragen`,
`Zum alten Glockenweg aufsteigen`, `Den Weg zum Hang erkunden`,
`Richtung Wald aufbrechen`, `Am Brunnen lauschen`, `Den trüben Eimer prüfen`,
`Den Brunnen noch einmal ansehen`, `Dem Jungen mit der roten Schnur folgen`,
`Die Abflussrinne untersuchen (Geschick, leicht)`,
`Ihn nach dem letzten Knoten fragen (Charisma, mittel)`,
`Die eingeritzten Namen genauer prüfen (Geschick, leicht)`,
`Nach dem Gebetsband fragen (Charisma, mittel)`,
`Das Gebetsband verlangen (Stärke, mittel)`,
`Der Schleifspur allein nachgehen (Geschick, mittel)`,
`Der Schleifspur allein nachgehen (Geschick, schwer)`.

## Wissenskeys der Nebenreihen

`muehle_stillstand`, `renniks_druck`, `fluechtlinge_muehle`, `wasser_truebung`,
`grovin_zisterne`, `dennek_schuld`, `versorgung_muster`, `gasse_leer`,
`kesseljahr`, `ilses_liste`, `ungerufener_name`.

## Rückbindungen (bereits verdrahtet)

Mühle: Dorfplatz, Holm, Mara/Brot, Was-du-weißt, Wald, Epilog, Tod Steg/Rennik.
Brunnen: Dorfplatz, Platz-Label, Kern, Was-du-weißt, Wald, Epilog, Tod Zisterne.
Gasse: Dorfplatz, Holm, Mara, Was-du-weißt, Wald, Epilog. Kein Tod.
Ungerufener Name: Schmiede-Rinne, Holm-Siegel, Junge am Brunnen, Mehlsack,
Bettler, Mara, Glocke, Köhler, Lager-Flucht, Lager-Nachspiel, Epilog. Kein neuer Ort.

## Freie Randorte (Vorschlag, nicht reserviert)

Noch ungenutzt als Quest-Konfliktort: Kapelle ist Glockenweg (nicht anfassen),
Schmiede-Innenraum ist Kleinquest, Apotheke ist Kern, Steinbruch ist Hauptplot.
Eine dritte Versorgungsquest braucht einen **anderen** Dorfrand als Flusssteg
und Zisterne.
