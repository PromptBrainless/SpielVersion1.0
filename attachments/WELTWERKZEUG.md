# Weltwerkzeug — eine Fläche, drei Speicher

**Stand:** Planung, 20. September 2026. **Nicht gebaut.**
Ersetzt als Zielbild: `docs/SPIELLEITER.md` + `docs/EDITOR.md`.
Beide Oberflächen tun dasselbe: die Welt anfassen. Sie sollen **eine** werden, **während des Spiels** erreichbar.

---

## Warum das heute doppelt ist

Es gibt drei Werkzeuge und vier Speicher für denselben Vorgang.

| Oberfläche | Wann | Was sie ändert |
|---|---|---|
| Titel → Texte im Spiel | Flag, dann inline auf der Karte | nur Zeilen |
| HUD → Spielleiter | während der Partie | Karte, Bild, Zustände, Lagen, Held |
| Titel → Werkstatt `/editor` | **ohne** Partie | Fluss, Probe, Wissen, Pfade, tote Knoten, Bilder, JSON |

| Speicher | Schlüssel | Inhalt |
|---|---|---|
| `lindendorf-save-v1` | eine Partie | Held (Leben, Flags, Log) |
| `lindendorf.spielleiter.karten.v1` | Hash der **aktuellen** Karte | Text, Bild, Karten-Zustände |
| `lindendorf-text-pack-v1` + Datei `text-pack.json` | Hash der **Original**-Karte | nur Titel, Zeilen, Wahlen |
| `lindendorf-author-v1` / `lindendorf.spielleiter.an` | an/aus | zwei Schalter für denselben Modus |

Beim Speichern einer Karte schreibt das Spiel **beide** Patch-Speicher. Die Hashes sterben, sobald ein Quelltext sich ändert. Die Werkstatt kennt die Partie nicht. Der Spielleiter kennt Fluss und Probe nicht.

Das ist ein Werkzeug, das sich in drei Türen versteckt hat.

---

## Zielbild

Ein **Weltwerkzeug**. Eine Schublade. Dieselbe Komponente mit und ohne laufende Partie.

- Im Spiel: HUD-Knopf **Welt** (ersetzt Spielleiter). `Alt+S`. `?welt=1`.
- Am Titel: **Weltwerkzeug** (ersetzt Werkstatt **und** den Extra-Schalter Textmodus).
- `/editor` fällt weg oder leitet nur noch auf dasselbe Blatt.
- Kein zweites State-Framework, kein Monaco, kein Git-Push aus der Fläche.

Die Partie bleibt sichtbar darunter. Die Schublade verdeckt den Text nicht dauerhaft; sie klappt.

---

## Drei Speicher, ausdrücklich, nie gemischt

Jede Änderung sagt, **wohin** sie geht. Heute passiert das still.

### 1. Partie — der Held

**Wohin:** bestehendes `lindendorf-save-v1` (Knopf Speichern in der HUD).

**Was:** LP, Gold, Inventar, Flags, `effekte`, `entscheidungen`.

**Wann:** Gunst/Last am Held, Lage vorlegen, Wissen-Flags **nur** wenn eine Partie läuft und du „auf diesen Held" wählst.

**Lebensdauer:** mit dem Spielstand. Neues Abenteuer = weg. Anderer Browser = weg.

**Ergänzung — Ruf und Erinnerung sind hier keine eigenen Felder, sondern Ansichten auf `entscheidungen`:** Eine „Gunst am Held ändern"-Aktion im Weltwerkzeug schreibt keinen Ruf-Wert direkt, sondern einen Eintrag `{ typ: "ruf", ziel, wert }` ins Log — genau wie es eine normale Szene auch täte. `rufAus(held, ziel)` liest danach denselben Weg zurück, den auch das Spiel nutzt. Das Werkzeug bekommt dadurch keinen Sonderpfad, der am eigentlichen Spielcode vorbeischreibt — jede Werkzeug-Aktion ist eine simulierte Spielhandlung, kein Direktzugriff auf ein Zahlenfeld.

### 2. Auflage — die Welt in diesem Browser

**Wohin:** ein Speicher `lindendorf.welt.v2`. Ersetzt Karten-Store **und** Text-Pack-localStorage.

**Was:** Abweichung **pro Szene**: Titel, Zeilen, Wahlen (gleiche Anzahl), Bild, Portrait, Karten-Zustände an/fort.

**Schlüssel:** `szeneId` an `present({ id })`. Solange eine Szene keine Id hat: alter Text-Hash als Fallback, sichtbar als „hält nur, solange der Satz gleich bleibt".

**Wann:** „Auf dieser Karte merken". Auto-merken wie heute ist erlaubt, aber mit sichtbarer Marke *gemerkt* und einer Liste aller Auflagen.

**Lebensdauer:** über Partien hinweg, nur in diesem Browser. Quelltext-Änderung mit stabiler Id überlebt. Ohne Id stirbt die Auflage.

**Ergänzung — Verlauf statt nur Endstand:** Jede Auflage speichert zusätzlich `vorherigerText` (eine Ebene zurück, kein voller Undo-Stack). Ein Klick auf **Rückgängig** in der Karte stellt genau die letzte Fassung wieder her, ohne das ganze `welt.v2` durchsuchen zu müssen. Das ist bewusst kein History-Stack wie bei einem Texteditor — nur eine Sicherheitsstufe gegen den häufigsten Fehler: aus Versehen überschrieben.

### 3. Kanon — der Quelltext des Spiels

**Wohin:** JSON-Module und `commitPack(..., apply=true)` in `quest-*.ts` / `content.ts` / `lager-content.ts`.

**Was:** Texte, die **jede** Partie so sehen soll.

**Wann:** nur nach Bestätigung **In den Kanon**. Nie still. Nie Git.

**Lebensdauer:** im Repo, sobald jemand committet. Bis dahin nur auf der Maschine, die den Dev-Server hat.

Bilder, die du hochlädst, liegen unter `public/art/sl/`. Die Auflage speichert den Pfad. In den Kanon kommen sie erst, wenn du sie einer `ArtKey`/`PortraitKey` zuweist — das bleibt Auftrag, keine Automatik.

**Ergänzung — Kanon-Diff vor dem Schreiben:** „In den Kanon" zeigt vor der Bestätigung eine zeilengenaue Gegenüberstellung Kanon-Text vs. Auflage-Text (nicht nur die Zahl „n Karten weichen ab"). Ohne das committet man leicht eine vergessene Testzeile mit. Der Diff ist reine Anzeige, kein eigener Speicher — er liest live aus (2) und (3) und vergleicht.

---

## Eine Fläche, drei Fächer

Nicht sieben Werkstatt-Reiter plus fünf Spielleiter-Akkordeons. Drei Fächer. Der Rest hängt darunter.

### Fach Karte (Standard im Spiel)

Die aktuelle Szene. Genau das, was der Spielleiter schon kann, plus:

- Titel, Zeilen, Wahlen (Anzahl fest)
- Hintergrund, Portrait, Upload
- Zustände, die diese Karte **gibt** und **nimmt**
- Zurücksetzen auf den Kanon dieser Id
- **Rückgängig** (letzte Auflage-Fassung, siehe oben)
- **Diff-Ansicht** (Kanon vs. Auflage, ausklappbar, standardmäßig eingeklappt)
- Badge **gemerkt**, wenn diese Karte eine Auflage hat — sichtbar auch, wenn das Fach geschlossen ist (siehe HUD unten)

Ohne laufende Szene: leer, Hinweis „erst spielen, dann die Karte anfassen".

Speichert nach **Auflage** (2), nicht in den Held.

### Fach Held

Nur mit laufender Partie, sonst ein klarer Simulator-Modus mit Banner **nicht die Partie**.

- Gunst/Last sofort auf den lebendigen Held → schreibt einen `entscheidungen`-Eintrag → Speicher **Partie** (1)
- Lage vorlegen (Herkunft) → Partie
- **Ruf-Anzeige** (abgeleitet über `rufAus()`, nicht editierbar als Zahl — nur über Gunst/Last-Aktionen veränderbar, damit jede Änderung im Log nachvollziehbar bleibt)
- **Wissens-Ansicht** (neu): Ausgabe von `deriveKnowledge(held)`, gruppiert nach `KNOWLEDGE_META`-Typ (material/sozial/ort/übernatürlich) statt einer flachen Liste — macht auf einen Blick sichtbar, wovon der Held wie viel weiß
- **Erinnerungs-Ansicht** (neu): `entscheidungen`-Einträge vom Typ `npc`, gruppiert nach NPC — zeigt, was sich welche Figur merkt, ohne den Rohcode des Logs lesen zu müssen
- Probe **auf diesen Held** nur hinter einem extra Knopf; Standard-Probe schreibt nichts

Die Werkstatt-Wissensflags gehören hierher, nicht in ein eigenes Fenster. Kippen ohne „auf diesen Held" bleibt Simulation und verfällt beim Schließen.

### Fach Prüfen

Alles, was die alte Werkstatt konnte und **keine** Welt schreibt, außer du exportierst bewusst.

- Fluss durchklicken (Vorschau, startet keine Partie)
- Questpfade legen (Journal-Vorschau)
- Tote Knoten, Bildschlüssel
- **Schwierigkeitskurve** (neu): Proben nach Kapitel/Ort gruppiert, min/max/Durchschnitt — macht sichtbar, wenn eine einzelne Probe unbemerkt zu leicht oder zu schwer geworden ist
- Module: JSON holen / JSON lesen, **pro Modul einzeln** (Wissen, Proben, Wege, Quests getrennt exportierbar, nicht eine Sammeldatei), jeweils gegen das eigene Zod-Schema validiert vor dem Export
- **In den Kanon** nur hier, mit Zähler „n Karten weichen ab" **und** der Diff-Ansicht aus dem Kanon-Abschnitt oben, bevor bestätigt wird
- Link auf den bestehenden Mobile-Smoke-Test (`scripts/check-darkfantasy-mobile.mjs`) statt eines zweiten, parallelen Testwegs

Playwright bleibt außerhalb. Prüfen misst Fluss, Bilder, Wissen im Browser.

---

## Öffnen während des Spiels — HUD

Bisherige Zeile:

```
HUD:  Status ▾   Speichern   Wissen   Welt
```

Das ist ein guter Anfang, verrät aber nicht, *ob* gerade etwas von der Norm abweicht. Erweiterung um Zustandsanzeigen statt reiner Aktions-Knöpfe:

```
┌─────────────────────────────────────────────────────┐
│  Status ▾    Speichern    Wissen (7)    Welt ● 3     │
└─────────────────────────────────────────────────────┘
```

- **Wissen (7)** — Zahl in Klammern ist die aktuelle Größe von `deriveKnowledge(held)`. Kein neuer Zustand, nur eine Anzeige dessen, was ohnehin berechnet wird.
- **Welt ● 3** — der Punkt erscheint nur, wenn die aktuelle Szene eine Auflage hat (Kanon ≠ Auflage). Die Zahl daneben ist die Gesamtzahl abweichender Karten in diesem Browser, nicht nur der aktuellen. Ohne Abweichungen: schlicht „Welt" ohne Punkt und Zahl — kein leerer Platzhalter, der Aufmerksamkeit bindet, wenn nichts abweicht.
- Simulator-Banner (Fach Held ohne Partie) bekommt eine feste Farbe (Orange/Gelb-Ton), damit er sich von normalen Hinweisen abhebt und man ihn nicht mit einem Fehler verwechselt.
- Mobile: dieselbe Zeile, aber die Schublade öffnet als Bottom-Sheet (nicht als Seitenpanel) und respektiert die Safe-Area unten — passend zum bestehenden Mobile-Smoke-Test, der genau das schon prüft.
- Tastenkürzel-Übersicht: `Alt+S` öffnet Welt, `Esc` schließt die Schublade, ohne die Partie zu unterbrechen — beides an derselben Stelle wie heute dokumentieren (`docs/PROJEKTKONTEXT.md`), damit es nicht nur im Code steht.

**Welt** öffnet die Schublade auf Fach **Karte**.
Titel-Schalter Textmodus entfällt: wer Welt öffnet, darf Zeilen in der Karte ändern. Inline-Stifte auf der Bühne nur, wenn die Schublade offen ist — sonst spielt man.

Kein zweites Panel. Kein `/editor` parallel zur Partie.

---

## Was sich an der Engine ändern muss, bevor Speichern hält

Ohne das bleibt jede Auflage ein Würfelwurf gegen den nächsten Textschliff.

1. `present()` bekommt optionales `id: string` (`"lager-hub"`, `"muehle-eingang"`). Fehlt es, Fallback-Hash wie heute, in der UI als brüchig markiert.
2. Runtime reicht `id` in `SceneView`.
3. Lookup: erst Id, dann Hash, dann Titel-Notnagel.
4. Ein Schema `WeltAuflage` (Zod), Version 2. Beim Laden: v1-Karten und Text-Pack **einmal** mergen, nicht dauerhaft doppeltschreiben.
5. **Neu:** Dieselbe Zod-Disziplin, die für `WeltAuflage` gilt, auf `entscheidungen` im Held anwenden (siehe separates Held-Schema-Vorhaben) — sonst validiert das Weltwerkzeug seine eigenen Schreibvorgänge strenger als das Spiel selbst seine.

Das ist der einzige Code-Schritt, der vor der Oberflächen-Zusammenlegung stehen sollte. Alles andere ist UI-Umzug.

---

## Was ausdrücklich nicht in dieses Werkzeug gehört

- Wahl-Anzahl, Verzweigungen, Flags der Quests umbauen
- Entscheidungs-Log von Hand fälschen (kommt über Spielhandlungen)
- Neue ArtKeys ohne Bildplan
- Ereignis-Würfel / Wetter — weiter leer, bis Auftrag
- Automatisch Git, automatisch Kanon
- Zustand- oder Monaco-Editor
- Die Partie im Fluss-Fach starten (sonst zwei Runtime)
- Ein eigener Undo-Stack über mehrere Ebenen (bewusst nur eine Stufe zurück, siehe Auflage-Abschnitt) — ein echter History-Stack ist ein eigenes, größeres Vorhaben

---

## Reihenfolge, wenn gebaut wird (nicht jetzt)

| # | Schritt | Risiko |
|---|---|---|
| 0 | Dieser Plan. Oberfläche unangetastet. | — |
| 1 | `id` an `present`, in `SceneView` | niedrig |
| 2 | `welt.v2` + einmalige Übernahme der zwei Alt-Speicher | niedrig |
| 3 | Eine Schublade, drei Fächer, HUD **Welt**, Titel ein Einstieg | mittel (nur UI) |
| 4 | HUD-Badges (Wissen-Zahl, Welt-Punkt) + Rückgängig auf Auflage-Ebene | niedrig, nach 3 |
| 5 | `/editor` und Textmodus-Flag entfernen | niedrig, nach 3 |
| 6 | Kanon-Diff-Ansicht vor dem Schreiben | niedrig, nach 3 |
| 7 | Kanon-Schreiben nur für Module, die schon `content.ts` sind | mittel, einzeln |
| 8 | Schwierigkeitskurve + Content-Export pro Modul in Fach Prüfen | niedrig, nach 7 |

Spielbar nach jedem Schritt. Kein Big-Bang.

---

## Erfolg

Du spielst. Du öffnest **Welt**. Du siehst am Knopf, dass diese Karte schon einmal geändert wurde. Du änderst den Satz am Brunnen. Du siehst **gemerkt (Auflage)**. Bei Bedarf machst du sie mit einem Klick rückgängig. Du speicherst die Partie extra. Du schreibst den Satz nur dann in den Kanon, wenn du das willst — und siehst vorher genau, was sich ändert. Die Werkstatt ist kein zweites Spiel mehr, sondern dasselbe Fach **Prüfen**.
