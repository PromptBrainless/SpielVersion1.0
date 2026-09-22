import { useState } from "react";
import { BookMarked, FlaskConical, LayoutGrid, MapPinned, ShieldCheck, ShieldQuestion, UserRound, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EffektId, Held, SceneView } from "@/game/types";
import type { Tageszeit } from "@/game/tageszeit";
import { useFokusFang } from "@/game/fokus-fang";
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
import { WeltKampagne } from "./WeltKampagne";
import { WeltQuest } from "./WeltQuest";
import { WeltSpieler } from "./WeltSpieler";
import { WeltWissen } from "./WeltWissen";

type Fach = "karte" | "held" | "stimme" | "wissen" | "kampagne" | "quest" | "spieler" | "pruefen";

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
  onLadeSpieler,
  onSpielerGeaendert,
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
  onLadeSpieler?: (name: string) => void;
  onSpielerGeaendert?: () => void;
}) {
  const [fach, setFach] = useState<Fach>(szene ? startFach : "pruefen");
  const fang = useFokusFang(true);
  const [fremd, setFremd] = useState<SceneView | null>(null);
  const [fremdPatch, setFremdPatch] = useState<WeltAuflage>({});
  const [vorschau, setVorschau] = useState<string | null>(null);
  const sicht = fremd ?? szene;
  const sichtAuflage = fremd ? fremdPatch : auflage;
  const sichtKey = fremd ? (fremd.id ?? "") : schluessel;
  const merkt = !auflageLeer(sichtAuflage);
  const werk = mapGmToolState(held, sicht, sichtAuflage);
  const bruechig = Boolean(sicht && sicht.idStabil !== true);
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
    <aside
      ref={fang}
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 max-h-[58vh] overflow-y-auto border-t border-border bg-bg text-fg sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(28rem,100vw)] sm:border-l sm:border-t-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welt-titel"
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 id="welt-titel" className="font-display text-2xl font-semibold">Welt</h1>
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
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-md border border-border bg-surface/40 p-1">
          {(
            [
              ["karte", "Karte", MapPinned],
              ["held", "Held", UserRound],
              ["stimme", "Stimme", FlaskConical],
              ["wissen", "Wissen", BookMarked],
              ["kampagne", "Kampagne", LayoutGrid],
              ["quest", "Quest", ShieldQuestion],
              ["spieler", "Partien", Users2],
              ["pruefen", "Prüfen", ShieldCheck],
            ] as const
          ).map(([id, titel, Symbol]) => (
            <button
              key={id}
              type="button"
              className={`inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 text-sm transition-colors duration-[var(--motion-quick)] ${
                fach === id ? "bg-surface-2 text-fg" : "text-muted-fg hover:text-fg"
              }`}
              onClick={() => setFach(id)}
              aria-current={fach === id}
            >
              <Symbol className="size-4" aria-hidden />
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
          <WeltHeld
            held={held}
            onEffekt={onEffekt}
            onLage={onLage}
            onTageszeit={onTageszeit}
            onVorschau={setVorschau}
            onLadeSpieler={onLadeSpieler}
            onSpielerGeaendert={onSpielerGeaendert}
          />
        ) : null}
        {fach === "stimme" ? (
          <WeltEntwurf szene={sicht} auflage={sichtAuflage} schluessel={sichtKey} onChange={speichere} />
        ) : null}
        {fach === "wissen" ? <WeltWissen aktuell={sicht?.id} /> : null}
        {fach === "kampagne" ? <WeltKampagne aktuell={sicht?.id} onSeite={oeffneSeite} /> : null}
        {fach === "quest" ? <WeltQuest /> : null}
        {fach === "spieler" ? (
          <WeltSpieler aktuelleName={held?.name} onLade={onLadeSpieler} onGeaendert={onSpielerGeaendert} />
        ) : null}
        {fach === "pruefen" ? (
          <WeltPruefen
            szene={sicht}
            auflage={sichtAuflage}
            schluessel={sichtKey}
            held={held}
            onChange={speichere}
            seite
          />
        ) : null}
      </div>
    </aside>
  );
}
