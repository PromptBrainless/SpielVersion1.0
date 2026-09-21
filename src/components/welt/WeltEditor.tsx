import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EffektId, Held, SceneView } from "@/game/types";
import type { Tageszeit } from "@/game/tageszeit";
import { auflageLeer, type WeltAuflage } from "@/game/welt";
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
  const merkt = !auflageLeer(auflage);
  const bruechig = Boolean(szene && !szene.id);

  return (
    <aside className="fixed inset-0 z-40 overflow-y-auto bg-bg text-fg">
      <div className="mx-auto min-h-dvh max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Welt</h1>
            <p className="text-xs text-muted-fg">{merkt ? "gemerkt · Auflage" : "Kanon"}</p>
          </div>
          {onClose ? (
            <Button type="button" variant="ghost" className="h-11 px-3 text-sm" onClick={onClose}>
              Schließen
            </Button>
          ) : null}
        </div>
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
          szene ? (
            <WeltKarte
              szene={szene}
              auflage={auflage}
              schluessel={schluessel}
              bruechig={bruechig}
              onChange={onChange}
              onReset={onReset}
              onRueckgaengig={onRueckgaengig}
            />
          ) : (
            <p className="text-sm text-muted-fg">Keine Karte in dieser Ansicht.</p>
          )
        ) : null}
        {fach === "held" ? <WeltHeld held={held} onEffekt={onEffekt} onLage={onLage} onTageszeit={onTageszeit} /> : null}
        {fach === "stimme" ? <WeltEntwurf szene={szene} onChange={onChange} /> : null}
        {fach === "pruefen" ? (
          <WeltPruefen szene={szene} auflage={auflage} schluessel={schluessel} held={held} onChange={onChange} seite />
        ) : null}
      </div>
    </aside>
  );
}
