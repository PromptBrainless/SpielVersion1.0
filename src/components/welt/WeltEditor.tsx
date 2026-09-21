import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EffektId, Held, SceneView } from "@/game/types";
import type { Tageszeit } from "@/game/tageszeit";
import {
  auflageFuerSicht,
  auflageLeer,
  loescheAuflage,
  merkeAuflage,
  rueckgaengigAuflage,
  type WeltAuflage,
} from "@/game/welt";
import { viewAusKanon } from "@/game/welt-graph";
import { mapGmToolState } from "@/game/gm/mapGmToolState";
import { WeltEntwurf } from "./WeltEntwurf";
import { WeltHeld } from "./WeltHeld";
import { WeltKarte } from "./WeltKarte";
import { WeltPruefen } from "./WeltPruefen";

type Fach = "karte" | "held" | "stimme" | "pruefen";

export function WeltEditor({
  szene,
  auflage,
  schluessel,
  held,
  onChange,
  onReset,
  onClose,
  onEffekt,
  onLage,
  onRueckgaengig,
  onTageszeit,
  startFach = "karte",
}: {
  szene: SceneView | null;
  auflage: WeltAuflage;
  schluessel: string;
  held: Held | null;
  onChange: (next: WeltAuflage) => void;
  onReset: () => void;
  onClose?: () => void;
  onEffekt: (id: EffektId, an: boolean) => void;
  onLage: (frageIndex: number) => void;
  onRueckgaengig: () => void;
  onTageszeit?: (zeit: Tageszeit) => void;
  startFach?: Fach;
}) {
  const [fach, setFach] = useState<Fach>(szene ? startFach : "pruefen");
  const [fremd, setFremd] = useState<SceneView | null>(null);
  const [fremdPatch, setFremdPatch] = useState<WeltAuflage>({});
  const [vorschau, setVorschau] = useState<string | null>(null);
  const sicht = fremd ?? szene;
  const sichtAuflage = fremd ? fremdPatch : auflage;
  const sichtKey = fremd ? (fremd.id ?? "") : schluessel;
  const merkt = !auflageLeer(sichtAuflage);
  const werk = mapGmToolState(held, sicht, sichtAuflage);
  const bruechig = Boolean(sicht && !sicht.id);
  const nichtHeld = Boolean(fremd && fremd.id && fremd.id !== szene?.id);

  function oeffneSeite(id: string) {
    if (szene?.id === id) {
      setFremd(null);
      setFremdPatch({});
      setFach("karte");
      return;
    }
    const view = viewAusKanon(id);
    if (!view) return;
    setFremd(view);
    setFremdPatch(auflageFuerSicht(view).patch);
    setFach("karte");
  }

  function speichere(next: WeltAuflage) {
    if (fremd) {
      merkeAuflage(sichtKey, next, fremd.original ?? fremd);
      setFremdPatch(next);
      if (szene?.id === fremd.id) onChange(next);
      return;
    }
    onChange(next);
  }

  function reset() {
    if (fremd) {
      if (sichtKey) loescheAuflage(sichtKey);
      setFremdPatch({});
      return;
    }
    onReset();
  }

  function rueck() {
    if (fremd) {
      if (!sichtKey) return;
      const restored = rueckgaengigAuflage(sichtKey);
      if (restored) setFremdPatch(restored);
      else setFremdPatch({});
      return;
    }
    onRueckgaengig();
  }

  return (
    <aside className="safe-bottom fixed inset-x-0 bottom-0 z-40 max-h-[58vh] overflow-y-auto border-t border-border bg-bg text-fg sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(28rem,100vw)] sm:border-l sm:border-t-0">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Welt</h1>
            <p className="text-xs text-muted-fg">
              {nichtHeld ? "Ansicht · nicht der Held" : werk.stand === "auflage" ? "Auflage" : "Kanon"}
              {merkt && werk.stand === "kanon" ? " · gemerkt" : ""}
            </p>
            {vorschau ? <p className="mt-1 text-xs text-accent">{vorschau}</p> : null}
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" className="h-11 px-3 text-sm" onClick={onClose}>
              Schließen
            </Button>
          ) : null}
        </div>
        {nichtHeld ? (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-sm border border-border px-3 py-2 text-sm">
            <span>Du siehst {sicht?.title}. Der Held steht woanders.</span>
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => {
                setFremd(null);
                setFremdPatch({});
              }}
            >
              Zurück zur Partie
            </Button>
          </div>
        ) : null}
        <div className="mb-4 grid grid-cols-4 gap-1">
          {(
            [
              ["karte", "Karte"],
              ["held", "Held"],
              ["stimme", "Stimme"],
              ["pruefen", "Prüfen"],
            ] as const
          ).map(([id, titel]) => (
            <button
              key={id}
              type="button"
              className={`h-12 rounded-md text-sm ${fach === id ? "bg-surface-2 text-fg" : "text-muted-fg"}`}
              onClick={() => setFach(id)}
            >
              {titel}
            </button>
          ))}
        </div>
        {fach === "karte" ? (
          sicht ? (
            <WeltKarte
              szene={sicht}
              auflage={sichtAuflage}
              schluessel={sichtKey}
              bruechig={bruechig}
              onChange={speichere}
              onReset={reset}
              onRueckgaengig={rueck}
            />
          ) : (
            <p className="text-sm text-muted-fg">Keine Karte in dieser Ansicht.</p>
          )
        ) : null}
        {fach === "held" ? (
          <WeltHeld held={held} onEffekt={onEffekt} onLage={onLage} onTageszeit={onTageszeit} onVorschau={setVorschau} />
        ) : null}
        {fach === "stimme" ? (
          <WeltEntwurf szene={sicht} auflage={sichtAuflage} schluessel={sichtKey} onChange={speichere} />
        ) : null}
        {fach === "pruefen" ? (
          <WeltPruefen
            szene={sicht}
            auflage={sichtAuflage}
            schluessel={sichtKey}
            held={held}
            onChange={speichere}
            onSeite={oeffneSeite}
            seite
          />
        ) : null}
      </div>
    </aside>
  );
}
