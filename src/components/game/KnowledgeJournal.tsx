import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART } from "@/game/art";
import { wissenTafeln } from "@/game/wissen-tafeln";
import type { Held } from "@/game/types";

export function KnowledgeJournal({ held, onClose }: { held: Held; debug?: boolean; onClose: () => void }) {
  const tafeln = wissenTafeln(held);
  const [index, setIndex] = useState(0);
  const tafel = tafeln[index];
  const hintergrund = tafel ? ART[tafel.art] : ART.evidence;

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 bg-bg text-fg" role="dialog" aria-modal="true" aria-labelledby="wissen-tafel-title">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-fg">
            Was du weißt{tafeln.length ? ` · ${index + 1} / ${tafeln.length}` : ""}
          </p>
          <Button variant="ghost" className="h-11 px-3 text-sm" onClick={onClose} aria-label="Wissen schließen">
            <X className="size-4" aria-hidden />
            Schließen
          </Button>
        </div>
        {held.mal ? <p className="px-4 pb-2 text-sm leading-relaxed text-fg/90">{held.mal}</p> : null}
        {tafel ? (
          <figure className="m-0 flex min-h-0 flex-1 flex-col">
            <div className="relative h-[42vh] min-h-48 overflow-hidden bg-surface">
              <img src={hintergrund} alt="" className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" aria-hidden />
            </div>
            <figcaption className="flex-1 border-y border-border bg-ink px-4 py-4 sm:px-6">
              <p className={`text-xs uppercase tracking-wide ${tafel.offen ? "text-accent" : "text-ok"}`}>
                {tafel.offen ? "Offen" : "Sicher"}
              </p>
              <h2 id="wissen-tafel-title" className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {tafel.title}
              </h2>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed sm:text-base">
                {tafel.lines.map((zeile) => (
                  <p key={zeile}>{zeile}</p>
                ))}
              </div>
            </figcaption>
          </figure>
        ) : (
          <p className="px-4 text-sm text-muted-fg">Noch nichts, das sich als Tafel halten ließe.</p>
        )}
        {tafeln.length > 1 ? (
          <div className="safe-bottom grid grid-cols-2 gap-2 px-4 py-3">
            <Button
              type="button"
              variant="secondary"
              className="h-12"
              disabled={index === 0}
              onClick={() => setIndex((wert) => Math.max(0, wert - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Zurück
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-12"
              disabled={index >= tafeln.length - 1}
              onClick={() => setIndex((wert) => Math.min(tafeln.length - 1, wert + 1))}
            >
              Weiter
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
