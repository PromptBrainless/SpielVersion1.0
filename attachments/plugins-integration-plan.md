# Plugin-Integration — drei Ebenen kombiniert

Kombiniert: (1) bestehendes Quest-Plugin-System nutzen, (2) relevante Grok-Builder-Skills gezielt einbinden, (3) externe MCP-Connectoren nur wo sinnvoll.

---

## Ebene 1: Das Quest-Plugin-System existiert bereits — nutzen, nicht neu bauen

`.grok/skills/lindendorf-questreihe/` ist faktisch schon ein vollständiger Plugin-Vertrag für neue Quest-Module. Kein Neubau nötig, nur Integration der zuvor besprochenen Systeme (Ruf, Erinnerung, Entscheidungs-Log) in diesen bestehenden Vertrag:

| Bestehender Wiring-Schritt (`wiring.md`) | Anknüpfung an bisherige Pläne |
|---|---|
| 2. Typen: Feld auf `Held`, Default in `createHeld` | Gilt unverändert auch für neue Ruf-/Log-Felder |
| 3. Wissen: Key in `KnowledgeKey`, Bedingung in `deriveKnowledge` | Direkt kompatibel mit `KNOWLEDGE_META` (bereits umgesetzt) |
| 6. Rückbindungen in `script.ts` | **Ergänzen** um eine Zeile: `aendereRuf()`/`merkeDir()`-Aufruf pro Lösungsweg, damit jede neue Quest automatisch ins Log schreibt |
| 7. Knowledge-Gate-Checker | Bestehendes `scripts/check-knowledge-gates.mjs` bleibt die Prüfinstanz — kein Parallel-Tool bauen |

**Konkrete Ergänzung für `wiring.md`-Schritt 6**, als neue Tabellenzeile:

```md
| Reputation/Erinnerung | aendereRuf(held, szeneId, ziel, delta) oder merkeDir(held, szeneId, npcId, flagId) pro Lösungsweg, wo die Quest Vertrauen/Misstrauen erzeugt |
```

Das ist die einzige Änderung am bestehenden Skill nötig — alles andere (Steckbrief-Vorlage, Kanon-Register, Kollisionscheck) bleibt exakt wie es ist, weil es bereits genau das leistet, was ein Plugin-System leisten soll: klare Schnittstelle, erzwungene Reihenfolge, keine Bibliothek von Sonderfällen.

---

## Ebene 2: Grok-Builder-Skills — priorisiert nach echtem Nutzen fürs Projekt

| Skill | Priorität | Warum |
|---|---|---|
| `design-ui` | **hoch** | Deckt genau das "bessere HUD" aus dem Weltwerkzeug-Plan ab — Tokens, Typografie, Anti-"AI-Slop"-Regeln. Sollte direkt beim HUD-Umbau (Weltwerkzeug Schritt 3–4) gezogen werden, nicht separat. |
| `auth` | **hoch, aber Abwägung nötig** | Scaffold ist im Repo bereits vorhanden (`src/lib/auth/*`, `migrations/auth/0001_auth.sql`, better-auth), aber **nicht mit dem Held-Save verknüpft** — aktuell rein `localStorage`, ein Spielstand pro Browser. Ein echtes Konto würde "Wissen an Spielername gebunden" auf mehrere Geräte ausweiten. Abwägung: mehr Aufwand (Server-Speicher für Held-JSON, Migration bestehender lokaler Saves) gegen Komfort (Spielstand überlebt Browser-Wechsel). Nicht Voraussetzung für die bisherigen Pläne — kann unabhängig davon entschieden werden. |
| `building-games/save-persistence` | mittel | Reines Referenzwissen (localStorage vs. IndexedDB, Versionierung). Aktuell irrelevant, weil `entscheidungen`-Log klein ist — relevant erst, falls das Log durch viele Partien sehr groß wird oder mehrere Speicherstände parallel gehalten werden sollen (siehe „Fehlerquelle: Log wächst unbegrenzt" aus dem letzten Plan). |
| `imagine`, `generate2dsprite`, `generate2dmap`, `game-asset-core` | mittel | Art-Pipeline wird bereits informell genutzt (`artifacts/imagine_images/` mit 30+ generierten Bildern). Formalisieren hieße: `editor-assets.ts` um einen Hinweis "im Kanon erwartet, aber kein Bild zugewiesen" erweitern, statt nur toter Links zu prüfen. Kein Big-Bang, additive Erweiterung der bestehenden `pruefeAssets()`-Funktion. |
| `xai-api` (für dynamische KI-Texte) | **Vorsicht, nicht ohne Abwägung** | Würde technisch den allerersten Wunsch aus diesem Gespräch bedienen ("dynamische Textvarianten basierend auf Wissen"). Steht aber im Zielkonflikt mit dem eigenen Autorenregelwerk: `kanon.md`/`steckbrief.md` verlangen ausdrücklich handgeschriebene, nicht-generische Sätze ("Ausführlich ist erlaubt, leer ist es nicht", Szenenstimmen-Test pro Satz). Empfehlung: höchstens als **Entwurfshilfe in der Werkstatt** (Fach Prüfen), nie live im Spiel — jeder generierte Satz durchläuft danach denselben Steckbrief- und Kanon-Prozess wie handgeschriebener Text. |
| `multiplayer-p2p` | **kein Bedarf** | Solo-Textabenteuer, keine Anforderung dafür sichtbar. Nicht einplanen, außer ein konkretes Koop-Feature wird gewünscht. |

---

## Ebene 3: Externe MCP-Connectoren

Für ein rein clientseitiges Solo-Spiel aktuell **kein zwingender Bedarf**. Der einzige denkbare Anwendungsfall — ein GitHub-Connector für den "In den Kanon"-Schritt im Weltwerkzeug — widerspricht der dort bewusst getroffenen Entscheidung **"Nie Git"** (Kanon-Schreiben bleibt ein manueller, bestätigter Schritt, kein automatischer Commit). Empfehlung: keine MCP-Integration jetzt, Frage offen lassen für den Fall, dass später community-generierter Content (z. B. geteilte Weltwerkzeug-Auflagen) gewünscht wird.

---

## Reihenfolge

| # | Schritt | Ebene | Abhängigkeit |
|---|---|---|---|
| 1 | `design-ui`-Skill beim HUD-Umbau (Weltwerkzeug Schritt 3–4) ziehen | 2 | keine, läuft mit bestehendem Zeitplan |
| 2 | Wiring-Tabelle um Ruf/Erinnerung-Zeile ergänzen (`wiring.md`) | 1 | Entscheidungs-Log muss stehen (siehe Erweiterungsplan Schritt 1–2) |
| 3 | `pruefeAssets()` um Kanon-Erwartung erweitern | 2 | keine |
| 4 | Auth-Entscheidung treffen (ja/nein, unabhängig vom Rest) | 2 | keine, reine Produktentscheidung |
| 5 | `xai-api` höchstens als Werkstatt-Entwurfshilfe, mit Kanon-Review-Pflicht | 2 | Fach Prüfen aus dem Weltwerkzeug-Plan |
| — | MCP-Connectoren | 3 | zurückgestellt |

Nichts davon ist Voraussetzung für den bisherigen Erweiterungsplan (Entscheidungs-Log, Ruf, Content-Refactor) — es sind parallele, unabhängig entscheidbare Ergänzungen.
