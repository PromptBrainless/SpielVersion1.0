import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFokusFang } from "@/game/fokus-fang";
import { spieleStimmen, stoppeStimme, stimmenListe } from "@/game/stimme";
import { wissenTafeln } from "@/game/wissen-tafeln";
import type { Held } from "@/game/types";

export function KnowledgeJournal({ held, onClose }: { held: Held; debug?: boolean; onClose: () => void; an?: boolean }) {
  const tafeln = wissenTafeln(held);
  const fang = useFokusFang(true);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex((wert) => Math.min(wert, Math.max(0, tafeln.length - 1)));
  }, [tafeln.length]);
  const tafel = tafeln[index];
  const zuege = tafel ? stimmenListe(tafel.stimmeSrc, tafel.stimmen) : [];

  useEffect(() => {
    spieleStimmen(zuege);
    return () => stoppeStimme();
  }, [tafel?.id, zuege.join("|")]);

  return (
    <div ref={fang} className="pointer-events-auto fixed inset-0 z-40 bg-bg text-fg" role="dialog" aria-modal="true" aria-labelledby="wissen-tafel-title">
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
            <div className="relative min-h-56 flex-1 overflow-hidden bg-surface">
              <img src={tafel.bild} alt="" className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" aria-hidden />
            </div>
            <figcaption className="border-y border-border bg-ink px-4 py-4 sm:px-6">
              <p className={`text-xs uppercase tracking-wide ${tafel.offen ? "text-accent" : "text-ok"}`}>
                {tafel.offen ? "Offen" : "Gesehen"}
              </p>
              <h2 id="wissen-tafel-title" className="mt-1 font-display text-lg tracking-tight">
                {tafel.title}
              </h2>
              {zuege.length ? (
                <button
                  type="button"
                  className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-xs text-fg"
                  onClick={() => spieleStimmen(zuege)}
                >
                  <Volume2 className="size-3.5 text-accent" aria-hidden />
                  {zuege.length > 1 ? "Gespräch noch einmal" : "Stimme noch einmal"}
                </button>
              ) : null}
              <div className="mt-2 space-y-2.5 text-sm leading-relaxed sm:text-base">
                {tafel.lines.map((zeile, i) => (
                  <p key={`${i}-${zeile.slice(0, 32)}`}>{zeile}</p>
                ))}
              </div>
            </figcaption>
          </figure>
        ) : (
          <p className="px-4 text-sm text-muted-fg">Noch nichts, das sich als Bild halten ließe.</p>
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
