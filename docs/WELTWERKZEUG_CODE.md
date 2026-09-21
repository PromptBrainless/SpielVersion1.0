# Weltwerkzeug — Code, nacheinander, in unsere Dateien

Stand: 21. September 2026. Baut auf [WELTWERKZEUG.md](./WELTWERKZEUG.md) und dem PDF (Schritte 1–9).

Die Datei `attachments/WELTWERKZEUG_VOLLIMPLEMENTIERUNG.md` ist **kein** Einbau. Sie ist ein zweites Spiel: eigene `App.tsx`, `WeltEngine`-Klasse, Context, sieben Reiter, graues Tailwind, Beispieldaten `lager-hof`. Das widerspricht dem Plan (eine Fläche, drei Fächer, drei Speicher, kein zweites State-Framework, Token der Bühne).

Was daraus **bleibt**, als Funktionen, nicht als Parallelwelt:

| Idee dort | Wohin hier | Speicher |
|---|---|---|
| Graph | `WeltGraph.tsx` + `welt-graph.ts` (steht) | liest Kanon |
| Szenen-Bibliothek | `WeltBibliothek.tsx` unter Prüfen | liest Kanon, klickt → Karte |
| Regel-Checker | `welt-regeln.ts` + `WeltRegeln.tsx` unter Prüfen | schreibt nichts |
| Zeitstrahl | `WeltZeitstrahl.tsx` unter Held | liest Partie `entscheidungen` |
| Zustands-Register | `WeltZustaende.tsx` unter Prüfen | liest `ORT_ZUSTAENDE` + Auflagen |
| Figuren / Ruf | `WeltFiguren.tsx` unter Held | liest `rufListe(held)` |
| Anfassen auf der Bühne | `Anfassbar.tsx` in `SceneStage` | schreibt Auflage über `onPatch` |

Kein `src/types/world.ts`. Kein `hp`. Kein `WeltProvider`. Wahlen bleiben `string[]`, nicht `{ text, targetSceneId }`.

Schritte 1–7 aus dem Plan sind im Spiel. Dieser Text beginnt bei **8** und geht weiter. Spielbar nach jedem Schritt. Copy-paste in die genannten Pfade.

---

## Schritt 8 — Regel-Checker und Bibliothek (Fach Prüfen)

Neue Datei. Liest `QUESTS`, `FLUSS`, `ORT_ZUSTAENDE`, `ART`. Schreibt nichts.

```ts
// src/game/welt-regeln.ts
import { ART, PORTRAITS } from "./art";
import { FLUSS } from "./editor-fluss";
import { QUESTS } from "./json/baum";
import { zeilenMass } from "./pruefung-text";
import { ORT_ZUSTAENDE } from "./seiten-zustaende";
import { EFFEKT_IDS, type EffektId } from "./effekte";

export type RegelArt = "fehler" | "warnung" | "info";

export type RegelFund = {
  art: RegelArt;
  id?: string;
  titel?: string;
  text: string;
};

export function pruefeWelt(): RegelFund[] {
  const fund: RegelFund[] = [];
  const ids = new Set<string>();

  for (const quest of QUESTS) {
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) {
        ids.add(szene.id);
        const mass = zeilenMass(szene.lines ?? []);
        if (mass.leer) {
          fund.push({ art: "fehler", id: szene.id, titel: szene.title, text: "Seite ohne Text." });
        } else if (mass.kurz) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: `Text zu kurz (${mass.chars} Zeichen).` });
        }
        if (mass.stichpunkt) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: "Stichpunkt in den Zeilen." });
        }
        if (!(szene.art in ART)) {
          fund.push({ art: "fehler", id: szene.id, titel: szene.title, text: `Bildschlüssel fehlt: ${szene.art}.` });
        }
        if (szene.portrait && !(szene.portrait in PORTRAITS)) {
          fund.push({ art: "fehler", id: szene.id, titel: szene.title, text: `Porträt fehlt: ${szene.portrait}.` });
        }
        if (!szene.choices.length) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: "Keine Wahl. Nur ein Ende darf so leer sein." });
        }
      }
    }
  }

  for (const knoten of FLUSS) {
    for (const kante of knoten.weiter) {
      const imFluss = FLUSS.some((k) => k.id === kante.id);
      const imKanon = ids.has(kante.id);
      if (!imFluss && !imKanon) {
        fund.push({ art: "fehler", id: knoten.id, titel: knoten.titel, text: `Kante nach unbekannt: ${kante.id}.` });
      }
    }
  }

  const gegeben = new Set<EffektId>();
  for (const ort of Object.values(ORT_ZUSTAENDE)) {
    for (const id of ort.hinzu) gegeben.add(id);
  }
  for (const id of EFFEKT_IDS) {
    if (!gegeben.has(id)) {
      fund.push({ art: "info", text: `Zustand ${id} wird von keinem Ort vergeben.` });
    }
  }

  return fund;
}

export type BibliothekZeile = {
  id: string;
  titel: string;
  quest: string;
  teil: string;
  art: string;
  chars: number;
  wahlen: number;
};

export function bibliothek(): BibliothekZeile[] {
  const zeilen: BibliothekZeile[] = [];
  for (const quest of QUESTS) {
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) {
        zeilen.push({
          id: szene.id,
          titel: szene.title,
          quest: quest.titel,
          teil: teil.titel,
          art: szene.art,
          chars: zeilenMass(szene.lines ?? []).chars,
          wahlen: szene.choices.length,
        });
      }
    }
  }
  return zeilen;
}
```

```tsx
// src/components/welt/WeltRegeln.tsx
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { pruefeWelt, type RegelArt } from "@/game/welt-regeln";

const LABEL: Record<RegelArt, string> = { fehler: "Fehler", warnung: "Warnung", info: "Hinweis" };

export function WeltRegeln({ onSeite }: { onSeite?: (id: string) => void }) {
  const [an, setAn] = useState(false);
  const fund = useMemo(() => (an ? pruefeWelt() : []), [an]);
  const fehler = fund.filter((f) => f.art === "fehler");
  const warnung = fund.filter((f) => f.art === "warnung");
  const info = fund.filter((f) => f.art === "info");

  function bericht() {
    const text = fund.map((f) => `[${LABEL[f.art]}] ${f.id ?? "—"} ${f.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "welt-regeln.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-fg">Regel — liest Kanon, schreibt nichts.</p>
      <div className="mt-1 flex gap-2">
        <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setAn(true)}>
          Prüfen
        </Button>
        {an ? (
          <Button type="button" variant="ghost" className="h-9 px-3 text-xs" onClick={bericht}>
            Bericht
          </Button>
        ) : null}
      </div>
      {an ? (
        <p className="mt-2 text-xs text-muted-fg">
          {fehler.length} Fehler · {warnung.length} Warnungen · {info.length} Hinweise
        </p>
      ) : null}
      {fund.map((f, i) => (
        <p key={`${f.id ?? "x"}-${i}`} className="mt-1 text-sm">
          <span className={f.art === "fehler" ? "text-hp" : f.art === "warnung" ? "text-warn" : "text-muted-fg"}>
            {LABEL[f.art]}
          </span>
          {f.id && onSeite ? (
            <button type="button" className="ml-2 underline" onClick={() => onSeite(f.id!)}>
              {f.titel ?? f.id}
            </button>
          ) : f.titel ? (
            <span className="ml-2">{f.titel}</span>
          ) : null}
          <span className="ml-2 text-fg/90">{f.text}</span>
        </p>
      ))}
    </div>
  );
}
```

```tsx
// src/components/welt/WeltBibliothek.tsx
import { useMemo, useState } from "react";
import { bibliothek } from "@/game/welt-regeln";

export function WeltBibliothek({ onSeite }: { onSeite?: (id: string) => void }) {
  const [suche, setSuche] = useState("");
  const zeilen = useMemo(() => bibliothek(), []);
  const sichtbar = zeilen.filter((z) => {
    const q = suche.trim().toLowerCase();
    if (!q) return true;
    return `${z.id} ${z.titel} ${z.quest} ${z.teil}`.toLowerCase().includes(q);
  });

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-fg">Bibliothek — {zeilen.length} Seiten. Klick öffnet Karte, nicht die Partie.</p>
      <input
        className="mt-1 h-11 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
        placeholder="Titel, Id, Quest"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
      />
      <ul className="mt-2 max-h-72 overflow-y-auto text-sm">
        {sichtbar.map((z) => (
          <li key={z.id}>
            <button
              type="button"
              className="flex w-full items-baseline justify-between gap-2 py-1 text-left"
              onClick={() => onSeite?.(z.id)}
            >
              <span>{z.titel}</span>
              <span className="text-xs text-muted-fg">
                {z.quest} · {z.chars} Z. · {z.wahlen} Wahlen
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

In `WeltPruefen.tsx` **unter** dem Graph, vor dem alten Fluss-Walker:

```tsx
import { WeltBibliothek } from "./WeltBibliothek";
import { WeltRegeln } from "./WeltRegeln";

// … nach <WeltGraph aktuell={szene?.id} onPick={onSeite} />
<WeltBibliothek onSeite={onSeite} />
<WeltRegeln onSeite={onSeite} />
```

---

## Schritt 8b — Zeitstrahl, Figuren, Zustände

Liest die Partie. Fälscht das Log nicht.

```tsx
// src/components/welt/WeltZeitstrahl.tsx
import type { Held } from "@/game/types";

export function WeltZeitstrahl({ held }: { held: Held | null }) {
  const log = [...(held?.entscheidungen ?? [])].sort((a, b) => a.timestamp - b.timestamp);
  if (!held) {
    return <p className="mt-3 text-sm text-muted-fg">Zeitstrahl braucht die Partie.</p>;
  }
  if (!log.length) {
    return <p className="mt-3 text-sm text-muted-fg">Noch kein Eintrag im Log.</p>;
  }
  return (
    <ol className="mt-3 border-l border-border pl-3">
      {log.map((e, i) => (
        <li key={`${e.timestamp}-${e.typ}-${e.ziel}-${i}`} className="mb-2 text-sm">
          <p className="text-xs text-muted-fg">
            {new Date(e.timestamp).toLocaleString("de-DE")} · {e.typ} · {e.szeneId}
          </p>
          <p>
            {e.ziel}
            {typeof e.wert === "number" ? ` ${e.wert > 0 ? "+" : ""}${e.wert}` : e.wert !== true ? ` · ${String(e.wert)}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
```

```tsx
// src/components/welt/WeltFiguren.tsx
import { rufListe } from "@/game/reputation";
import type { Held } from "@/game/types";

export function WeltFiguren({ held }: { held: Held | null }) {
  if (!held) return <p className="mt-3 text-sm text-muted-fg">Ruf braucht die Partie.</p>;
  const liste = rufListe(held);
  if (!liste.length) return <p className="mt-3 text-sm text-muted-fg">Noch kein Ruf im Log.</p>;
  return (
    <ul className="mt-3 text-sm">
      {liste.map((item) => (
        <li key={item.ziel} className="flex justify-between gap-2">
          <span>{item.ziel}</span>
          <span className={item.wert < 0 ? "text-hp" : "text-ok"}>{item.wert > 0 ? `+${item.wert}` : item.wert}</span>
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// src/components/welt/WeltZustaende.tsx
import { EFFEKT_IDS, EFFEKTE } from "@/game/effekte";
import { ORT_ZUSTAENDE } from "@/game/seiten-zustaende";

export function WeltZustaende() {
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-fg">Zustände — welcher Ort gibt, nimmt, lässt fort.</p>
      <ul className="mt-2 text-sm">
        {EFFEKT_IDS.map((id) => {
          const gibt = Object.entries(ORT_ZUSTAENDE)
            .filter(([, o]) => o.hinzu.includes(id))
            .map(([k]) => k);
          const nimmt = Object.entries(ORT_ZUSTAENDE)
            .filter(([, o]) => o.nimmt.includes(id))
            .map(([k]) => k);
          return (
            <li key={id} className="mb-1">
              <span className="font-medium">{EFFEKTE[id].name}</span>
              <span className="ml-2 text-xs text-muted-fg">
                gibt {gibt.join(", ") || "—"} · nimmt {nimmt.join(", ") || "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

In `WeltHeld.tsx` nach Erinnerung, vor der Probe:

```tsx
import { WeltFiguren } from "./WeltFiguren";
import { WeltZeitstrahl } from "./WeltZeitstrahl";

<p className="mt-3 text-xs text-muted-fg">Ruf — Ansicht aufs Log, keine Zahl zum Tippen.</p>
<WeltFiguren held={held} />
<p className="mt-3 text-xs text-muted-fg">Zeitstrahl — dieselben Einträge.</p>
<WeltZeitstrahl held={held} />
```

In `WeltPruefen.tsx` nach den Regeln:

```tsx
import { WeltZustaende } from "./WeltZustaende";
<WeltZustaende />
```

---

## Schritt 9 — Anfassen auf der Bühne

Kein Context. Kein `@floating-ui`. Hover und Popover leben im Wrapper. Speichern geht über denselben `onPatch`, den `SceneStage` schon hat. `weltAktiv()` bleibt der Schalter (`Alt+S` / HUD Welt).

```ts
// src/game/anfassen.ts
export type AnfassAdresse =
  | { feld: "titel" }
  | { feld: "zeile"; index: number }
  | { feld: "wahl"; index: number }
  | { feld: "hintergrund" }
  | { feld: "portrait" };

export function adresseZuText(a: AnfassAdresse): string {
  switch (a.feld) {
    case "titel":
      return "Titel";
    case "zeile":
      return `Zeile ${a.index + 1}`;
    case "wahl":
      return `Wahl ${a.index + 1}`;
    case "hintergrund":
      return "Hintergrund";
    case "portrait":
      return "Porträt";
  }
}
```

```tsx
// src/components/game/Anfassbar.tsx
import { type ReactNode, useEffect, useRef, useState } from "react";
import { adresseZuText, type AnfassAdresse } from "@/game/anfassen";

export function Anfassbar({
  adresse,
  aktiv,
  children,
  editor,
}: {
  adresse: AnfassAdresse;
  aktiv: boolean;
  children: ReactNode;
  editor: (schliessen: () => void) => ReactNode;
}) {
  const [offen, setOffen] = useState(false);
  const [hover, setHover] = useState(false);
  const kasten = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!offen) return;
    function aussen(ev: MouseEvent) {
      if (kasten.current && !kasten.current.contains(ev.target as Node)) setOffen(false);
    }
    function taste(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOffen(false);
    }
    window.addEventListener("mousedown", aussen);
    window.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("mousedown", aussen);
      window.removeEventListener("keydown", taste);
    };
  }, [offen]);

  if (!aktiv) return <>{children}</>;

  return (
    <span
      ref={kasten}
      className={`relative inline-block cursor-pointer rounded-sm outline outline-2 transition-colors ${
        offen ? "outline-accent" : hover ? "outline-accent/40" : "outline-transparent"
      }`}
      title={adresseZuText(adresse)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(ev) => {
        ev.stopPropagation();
        setOffen((v) => !v);
      }}
    >
      {children}
      {offen ? (
        <span
          className="absolute left-0 top-full z-50 mt-1 min-w-56 rounded-sm border border-border bg-ink p-2 shadow-sm"
          onClick={(ev) => ev.stopPropagation()}
        >
          {editor(() => setOffen(false))}
        </span>
      ) : null}
    </span>
  );
}
```

Kleine Felder, einmal, für Titel/Zeile/Wahl und Bildraster:

```tsx
// src/components/game/AnfassFelder.tsx
import { ART, PORTRAITS } from "@/game/art";
import { Button } from "@/components/ui/button";
import type { ArtKey, PortraitKey } from "@/game/types";

export function TextFeld({
  wert,
  mehrzeilig,
  aufSpeichern,
  aufAbbrechen,
}: {
  wert: string;
  mehrzeilig?: boolean;
  aufSpeichern: (neu: string) => void;
  aufAbbrechen: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        aufSpeichern(String(data.get("text") ?? wert));
      }}
    >
      {mehrzeilig ? (
        <textarea
          name="text"
          defaultValue={wert}
          className="min-h-24 w-72 max-w-[80vw] rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        />
      ) : (
        <input
          name="text"
          defaultValue={wert}
          className="w-72 max-w-[80vw] rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        />
      )}
      <div className="mt-1 flex gap-1">
        <Button type="submit" className="h-8 px-2 text-xs">
          Merken
        </Button>
        <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={aufAbbrechen}>
          Weg
        </Button>
      </div>
    </form>
  );
}

export function BildRaster({
  art,
  portrait,
  aufArt,
  aufPortrait,
}: {
  art?: ArtKey;
  portrait?: boolean;
  aufArt?: (key: ArtKey) => void;
  aufPortrait?: (key: PortraitKey | null) => void;
}) {
  const eintraege = portrait ? Object.entries(PORTRAITS) : Object.entries(ART);
  return (
    <div className="grid max-h-56 w-72 max-w-[80vw] grid-cols-4 gap-1 overflow-y-auto">
      {portrait ? (
        <button type="button" className="h-12 border border-border text-xs text-muted-fg" onClick={() => aufPortrait?.(null)}>
          keins
        </button>
      ) : null}
      {eintraege.map(([key, src]) => (
        <button
          key={key}
          type="button"
          className={`h-12 overflow-hidden border ${key === art ? "border-accent" : "border-border"}`}
          onClick={() => (portrait ? aufPortrait?.(key as PortraitKey) : aufArt?.(key as ArtKey))}
        >
          <img src={src} alt={key} className="size-full object-cover" />
        </button>
      ))}
    </div>
  );
}
```

Einbau in `SceneStage.tsx` — nur die sichtbaren Stücke, `onPatch` unverändert. `aktiv={authorMode}` (dasselbe Flag wie bisher, gesetzt wenn Welt offen).

```tsx
import { Anfassbar } from "./Anfassbar";
import { BildRaster, TextFeld } from "./AnfassFelder";

// Hintergrund umschließen:
<Anfassbar
  adresse={{ feld: "hintergrund" }}
  aktiv={authorMode}
  editor={(zu) => (
    <BildRaster
      art={view.art}
      aufArt={(art) => {
        onPatch({ ...patch, art });
        zu();
      }}
    />
  )}
>
  <StageMedia src={hintergrund} poster={hintergrundPoster} kenBurns={!isMotion(hintergrund)} className="size-full object-cover" />
</Anfassbar>

{portrait ? (
  <Anfassbar
    adresse={{ feld: "portrait" }}
    aktiv={authorMode}
    editor={(zu) => (
      <BildRaster
        portrait
        aufPortrait={(key) => {
          onPatch({ ...patch, portrait: key });
          zu();
        }}
      />
    )}
  >
    <StageMedia src={portrait} poster={portraitPoster} className="absolute bottom-3 right-3 h-28 w-20 rounded-lg border border-border object-cover shadow-sm sm:h-36 sm:w-24" />
  </Anfassbar>
) : null}

// Titel, wenn nicht schon das große Formular:
<Anfassbar
  adresse={{ feld: "titel" }}
  aktiv={authorMode}
  editor={(zu) => (
    <TextFeld
      wert={patch.title ?? view.title}
      aufSpeichern={(neu) => {
        onPatch({ ...patch, title: neu });
        zu();
      }}
      aufAbbrechen={zu}
    />
  )}
>
  <h2 className="tafel-zeile mb-3 font-display text-xl font-semibold tracking-tight sm:text-2xl">{view.title}</h2>
</Anfassbar>

{view.lines.map((zeile, i) => (
  <Anfassbar
    key={`${view.textKey}-z-${i}`}
    adresse={{ feld: "zeile", index: i }}
    aktiv={authorMode}
    editor={(zu) => (
      <TextFeld
        mehrzeilig
        wert={zeile}
        aufSpeichern={(neu) => {
          const lines = [...view.lines];
          lines[i] = neu;
          onPatch({ ...patch, lines });
          zu();
        }}
        aufAbbrechen={zu}
      />
    )}
  >
    <p className="tafel-zeile mb-2 text-sm leading-relaxed sm:text-base">{zeile}</p>
  </Anfassbar>
))}

{view.choices.map((wahl, i) => (
  <Anfassbar
    key={`${view.textKey}-w-${i}`}
    adresse={{ feld: "wahl", index: i }}
    aktiv={authorMode}
    editor={(zu) => (
      <TextFeld
        wert={wahl}
        aufSpeichern={(neu) => {
          const choices = view.choices.map((alt, n) => (n === i ? neu || alt : alt));
          onPatch({ ...patch, choices });
          zu();
        }}
        aufAbbrechen={zu}
      />
    )}
  >
    <span>{wahl}</span>
  </Anfassbar>
))}
```

Anzahl der Wahlen bleibt. Effekt-Chips bleiben in Fach Karte. Kein zweiter Speicher.

Wenn `authorMode` schon das große Textarea zeigt: Anfassen **oder** das Formular, nicht beides. Empfehlung: Formular in der Schublade lassen, auf der Bühne nur Anfassen. Dann in `SceneStage` das `authorMode`-Textarea entfernen, sobald Anfassen sitzt.

---

## Was aus der Vollimplementierung bewusst fehlt

- `WeltEngine` als Klasse — `welt.ts` + `pruefeWelt()` tun dasselbe ohne Objektzustand.
- `Choice.targetSceneId` — der Spielgraph hängt in `script.ts` / `FLUSS`, nicht in den JSON-Wahlen.
- `Hero.hp`, `SceneInstance.visitCount` — Held hat `lp`, Besuch zählt das Spiel nicht.
- Sieben Tabs, Planung, Notizen — hängen unter Prüfen / Held, oder bleiben leer bis Auftrag.
- Context, Vite-Zweitprojekt, Tailwind-Grau, `initialKanon` mit drei Lagern.
- Automatisches Git.

---

## Reihenfolge (Fortführung der Tabelle)

| # | Schritt | Dateien |
|---|---|---|
| 8 | Regeln + Bibliothek | `welt-regeln.ts`, `WeltRegeln.tsx`, `WeltBibliothek.tsx`, `WeltPruefen.tsx` |
| 8b | Zeitstrahl, Ruf, Ortszustände | `WeltZeitstrahl.tsx`, `WeltFiguren.tsx`, `WeltZustaende.tsx`, `WeltHeld.tsx` |
| 9 | Anfassen auf der Bühne | `anfassen.ts`, `Anfassbar.tsx`, `AnfassFelder.tsx`, `SceneStage.tsx` |

Danach: `/editor` streichen (Plan-Schritt 5), wenn die Schublade überall denselben Editor trägt.

Spielbar nach jedem Schritt. Kein Big-Bang.
