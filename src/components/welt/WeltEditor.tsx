import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EffektId, Held, SceneView } from "@/game/types";
import type { Tageszeit } from "@/game/tageszeit";
import { auflageLeer, type WeltAuflage } from "@/game/welt";
import { WeltHeld } from "./WeltHeld";
import { WeltKarte } from "./WeltKarte";
import { WeltPruefen } from "./WeltPruefen";

type Fach = "karte" | "held" | "pruefen";

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
  seite = false,
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
  seite?: boolean;
}) {
  const [fach, setFach] = useState<Fach>(szene ? startFach : "pruefen");
  const merkt = !auflageLeer(auflage);
  const bruechig = Boolean(szene && !szene.id);

  const schublade =
    "pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[min(48dvh,28rem)] overflow-y-auto border-t border-border bg-ink px-3 py-3 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:bottom-3 sm:max-h-[calc(100dvh-42vh-5.5rem)] sm:w-[26rem] sm:rounded-xl sm:border";
  const voll = "mx-auto min-h-dvh max-w-4xl bg-bg px-4 py-6 text-fg";

  return (
    <aside className={seite ? voll : schublade}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">Welt</p>
          <p className="text-xs text-muted-fg">{merkt ? "gemerkt · Auflage" : "Kanon"}</p>
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={onClose}>
            Schließen
          </Button>
        ) : null}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-1">
        {(
          [
            ["karte", "Karte"],
            ["held", "Held"],
            ["pruefen", "Prüfen"],
          ] as const
        ).map(([id, titel]) => (
          <button
            key={id}
            type="button"
            className={`h-11 rounded-md text-sm ${fach === id ? "bg-surface-2 text-fg" : "text-muted-fg"}`}
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
          <p className="text-sm text-muted-fg">Erst spielen, dann die Karte anfassen.</p>
        )
      ) : null}
      {fach === "held" ? <WeltHeld held={held} onEffekt={onEffekt} onLage={onLage} onTageszeit={onTageszeit} /> : null}
      {fach === "pruefen" ? (
        <WeltPruefen szene={szene} auflage={auflage} schluessel={schluessel} held={held} onChange={onChange} seite={seite} />
      ) : null}
    </aside>
  );
}
