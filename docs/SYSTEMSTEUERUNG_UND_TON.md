# Systemsteuerung und Ton

Zwei Dinge fehlten dem Spiel: ein Ort, an dem der Spieler etwas einstellen
kann, und Ton. Beides liegt jetzt in drei Dateien und greift nirgends in
Runtime, Szenenfluss oder Questlogik ein.

| Datei | Zweck |
|---|---|
| `src/game/einstellungen.ts` | Speicher für Ton, Darstellung, Spielverhalten |
| `src/game/use-einstellungen.ts` | React-Anbindung über `useSyncExternalStore` |
| `src/game/klang.ts` | prozeduraler Ton über die Web Audio API |
| `src/components/game/Systemsteuerung.tsx` | Bedienfeld mit fünf Fächern |
| `scripts/check-systemsteuerung.mjs` | Browserprüfung (`npm run check:system`) |

## Einstellungen

Ein einziger Speicher unter dem Schlüssel `lindendorf.einstellungen.v1`.
Lokal, ohne Server, ohne Konto.

`normalisiere()` nimmt beliebiges JSON und gibt immer gültige Einstellungen
zurück: Zahlen werden begrenzt, unbekannte Auswahlwerte fallen auf den
Standard, nur echte Wahrheitswerte zählen als Schalter. Ein alter oder
verbogener Eintrag kann das Spiel damit nicht aufhalten.

Beim allerersten Start werden die Gerätewünsche gelesen:
`prefers-reduced-motion` schaltet Bewegung und Bildzug ab,
`prefers-contrast` schaltet auf hohen Kontrast. Wer danach selbst etwas
stellt, behält das Gestellte.

`wendeEinstellungenAn()` schreibt alles an einer Stelle ins `<html>`:
Datenattribute (`data-kontrast`, `data-bewegung`, `data-koernung` …) für die
CSS-Schalter und Variablen (`--textskala`, `--zeilenabstand`, `--bildhoehe`)
für die Maße. Die Komponenten tragen keine Einstellungslogik.

Die Textgröße wirkt über `html { font-size: calc(100% * var(--textskala)) }`
und skaliert damit die ganze rem-basierte Oberfläche, nicht nur den
Szenentext.

Tests: `src/game/einstellungen.test.ts`, mitgeführt in `npm test`.

## Ton

Kein Audioarchiv. Alles entsteht im Browser aus Rauschen, Filtern und wenigen
Oszillatoren — das spart Ladezeit, Speicherplatz und Lizenzfragen, und es
passt zum Ton des Spiels besser als saubere Bibliotheksaufnahmen.

**Bausteine:** `drone` (tiefer Grundton), `wind` (gefiltertes Rauschen mit
wanderndem Filter), `murmeln` (Formantfilter für Stimmen), `streu`
(vereinzelte Ereignisse: Tropfen, Funken, Hammerschläge, Krähen).

**Orte:** zwölf Mischungen in `ORTE`. Der Ort folgt dem Szenenbild über
`ambienteFuerBild(view.art)`, die Tageszeit färbt ihn — nachts sinkt der
Pegel und der Filter schließt sich.

**Rückmeldungen:** dreizehn kurze Klänge, darunter ein taumelnder Würfel vor
jeder Probe, Erfolg und Misserfolg als Intervall, Seitenrascheln beim
Szenenwechsel, Treffer, Tod, Schlussakkord.

Zwei Busse (Ambiente, Effekte) unter einem Gesamtregler, dazu ein kurzer
Hall aus einer erzeugten Impulsantwort.

**Der Ton bleibt aus, bis jemand ihn einschaltet.** Browser verbieten Ton vor
der ersten echten Geste; `bindeKlang()` hängt sich an Klick, Tastendruck und
Tippen und entsperrt dann. Ein verdeckter Tab schweigt.

Ton ist nie wichtiger als das Spiel: jeder Aufruf ist gekapselt, ein Fehler
im Klangwerk hält nichts auf.

## Nebenbefund: das HUD klebte nicht

Die Bühne trug `overflow-y-auto`. Ein Überlaufwert auf einer Achse macht die
andere zum Scrollbehälter — das `sticky` HUD hing damit an einem Behälter,
der gar nicht scrollte, und rutschte beim Lesen nach oben aus dem Bild. Auf
dem Telefon war die Leiste nach dem ersten Absatz verschwunden.

Behoben, indem die Bühnenwurzel keine eigene Überlaufregel mehr setzt; den
seitlichen Überlauf fängt weiterhin `body` ab. `npm run check:system` prüft
die Haftung und den Querlauf bei 390 Pixeln mit.

## Tasten

| Taste | Wirkung |
|---|---|
| `1` – `9` | Wahl treffen (abschaltbar) |
| `Enter` | weiter, wenn es nur einen Weg gibt |
| `E` | Systemsteuerung |
| `M` | Ton stumm oder laut |
| `Esc` | Überlagerung schließen |
| `Alt` + `S` | Weltwerkzeug |
