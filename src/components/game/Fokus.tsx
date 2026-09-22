import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isMotion } from "@/game/art";
import type { FokusEintrag } from "@/game/fokus";
import { useEinstellungen } from "@/game/use-einstellungen";
import { spieleStimmen, stoppeStimme } from "@/game/stimme";

export function Fokus({ eintrag, onWeiter }: { eintrag: FokusEintrag; onWeiter: () => void }) {
  const bewegung = useEinstellungen().optik.bewegung;
  const still = bewegung === "aus";
  const bildDauer = still ? 900 : 2200;

  useEffect(() => {
    if (eintrag.art !== "bild") return;
    const t = window.setTimeout(onWeiter, bildDauer);
    return () => window.clearTimeout(t);
  }, [bildDauer, eintrag.art, onWeiter]);

  useEffect(() => {
    if (eintrag.art !== "wissen") return;
    spieleStimmen(eintrag.stimmen);
    return () => stoppeStimme();
  }, [eintrag]);

  useEffect(() => {
    function taste(event: KeyboardEvent) {
      if (event.key === "Enter" || event.key === "Escape" || event.key === " ") {
        event.preventDefault();
        onWeiter();
      }
    }
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [onWeiter]);

  if (eintrag.art === "bild") {
    const video = isMotion(eintrag.src);
    return (
      <button
        type="button"
        className="pointer-events-auto fixed inset-0 z-[35] bg-ink"
        onClick={onWeiter}
        aria-label={`${eintrag.titel} — Bild`}
      >
        {video ? (
          <video src={eintrag.src} className={`size-full object-cover ${still ? "" : "bild-fokus"}`} autoPlay muted loop playsInline aria-hidden />
        ) : (
          <img src={eintrag.src} alt="" className={`size-full object-cover ${still ? "" : "bild-fokus"}`} />
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" />
        <span className="absolute bottom-6 left-0 right-0 text-center font-display text-lg tracking-tight text-fg sm:text-xl">
          {eintrag.titel}
        </span>
      </button>
    );
  }

  const stimme = eintrag.art === "quest" ? "Die Geschichte" : "Was du nun weißt";
  return (
    <div className="pointer-events-auto fixed inset-0 z-[35] flex flex-col bg-bg text-fg" role="dialog" aria-modal="true" aria-labelledby="fokus-title">
      <div className="relative h-[36vh] min-h-40 overflow-hidden bg-surface">
        <img src={eintrag.hintergrund} alt="" className={`size-full object-cover ${still ? "" : "bild-fokus"}`} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" aria-hidden />
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6">
        <p className="text-xs uppercase tracking-wide text-muted-fg">{stimme}</p>
        <h2 id="fokus-title" className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {eintrag.title}
        </h2>
        <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto text-sm leading-relaxed sm:text-base">
          {eintrag.lines.map((zeile) => (
            <p key={zeile.slice(0, 48)}>{zeile}</p>
          ))}
        </div>
        <div className="safe-bottom pt-3">
          <Button type="button" className="h-12 w-full" onClick={onWeiter}>
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
}
