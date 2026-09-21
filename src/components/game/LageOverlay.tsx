import { Button } from "@/components/ui/button";
import { lageBild } from "@/game/art";
import { EFFEKTE } from "@/game/effekte";
import { sichtbareHerkunft } from "@/game/welt";

export function LageOverlay({
  frageIndex,
  onAntwort,
  onSchliessen,
}: {
  frageIndex: number;
  onAntwort: (antwortIndex: number) => void;
  onSchliessen: () => void;
}) {
  const frage = sichtbareHerkunft()[frageIndex];
  if (!frage) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-bg/80">
      <img src={lageBild(frage.id) || "/art/forest.jpg"} alt="" className="absolute inset-0 size-full object-cover opacity-40 grayscale" />
      <div className="relative mx-auto flex min-h-full max-w-xl flex-col justify-end px-4 py-8 sm:justify-center">
        <div className="rounded-xl border border-border bg-ink/92 p-5 shadow-lg backdrop-blur-md sm:p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Lage</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">{frage.titel}</h2>
          {lageBild(frage.id) ? (
            <figure className="mt-3 overflow-hidden rounded-md border border-border">
              <img src={lageBild(frage.id)} alt="" className="h-40 w-full object-cover grayscale sm:h-52" />
            </figure>
          ) : null}
          <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-fg sm:text-base">
            {frage.geschichte.map((absatz) => (
              <p key={absatz.slice(0, 28)}>{absatz}</p>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            {frage.antworten.map((antwort, index) => (
              <Button
                key={antwort.label}
                type="button"
                variant="choice"
                size="choice"
                onClick={() => onAntwort(index)}
              >
                <span className="block">
                  {antwort.label}
                  <span className="mt-1 block text-xs text-muted-fg">
                    {(antwort.effekte ?? []).map((id) => `${EFFEKTE[id].name} (${EFFEKTE[id].hint})`).join(" · ")}
                  </span>
                </span>
              </Button>
            ))}
          </div>
          <Button type="button" variant="ghost" className="mt-3 h-9 px-2 text-xs" onClick={onSchliessen}>
            Lage schließen
          </Button>
        </div>
      </div>
    </div>
  );
}
