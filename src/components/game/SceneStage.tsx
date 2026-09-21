import { Dices, PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ART, PORTRAITS, artSrcFor, isMotion, portraitSrcFor } from "@/game/art";
import { probeZeile } from "@/game/gm/probeZeile";
import type { KartePatch } from "@/game/welt";
import type { EffektId, SceneView } from "@/game/types";
import { leseTageszeit, tageszeitSchleier, type Tageszeit } from "@/game/tageszeit";
import { Hud } from "./Hud";
import { KnowledgeJournal } from "./KnowledgeJournal";
import { LageOverlay } from "./LageOverlay";

export function SceneStage({
  view,
  original,
  onChoose,
  onSave,
  saveMessage,
  onKnowledge,
  knowledgeOpen,
  debug,
  leiterOpen,
  patch,
  schluessel,
  onLeiter,
  onPatch,
  onResetKarte,
  authorMode,
  onEffekt,
  onHerkunft,
  onLageVorlegen,
  lageIndex,
  onLageAntwort,
  onLageSchliessen,
  onRueckgaengig,
  onTageszeit,
  wissenAnzahl,
  weltAnzahl,
  weltPunkt,
}: {
  view: SceneView;
  original: SceneView;
  onChoose: (index: number) => void;
  onSave: () => void;
  saveMessage: string | null;
  onKnowledge: () => void;
  knowledgeOpen: boolean;
  debug: boolean;
  leiterOpen: boolean;
  patch: KartePatch;
  schluessel: string;
  onLeiter: () => void;
  onPatch: (next: KartePatch) => void;
  onResetKarte: () => void;
  authorMode: boolean;
  onEffekt: (id: EffektId, an: boolean) => void;
  onHerkunft: (frageIndex: number, antwortIndex: number) => void;
  onLageVorlegen: (frageIndex: number) => void;
  lageIndex: number | null;
  onLageAntwort: (antwortIndex: number) => void;
  onLageSchliessen: () => void;
  onRueckgaengig: () => void;
  onTageszeit?: (zeit: Tageszeit) => void;
  wissenAnzahl: number;
  weltAnzahl: number;
  weltPunkt: boolean;
}) {
  const karte = view.original ?? { title: original.title, lines: original.lines, choices: original.choices };
  const [title, setTitle] = useState(view.title);
  const [body, setBody] = useState(view.lines.join("\n"));
  const [choices, setChoices] = useState(view.choices);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setTitle(view.title);
    setBody(view.lines.join("\n"));
    setChoices(view.choices);
    setStatus(null);
  }, [view.textKey, view.title, view.lines, view.choices]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (leiterOpen) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      const n = Number(event.key);
      if (n >= 1 && n <= view.choices.length) onChoose(n - 1);
      if (event.key === "Enter" && view.choices.length === 1 && !authorMode) onChoose(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authorMode, leiterOpen, onChoose, view.choices.length]);

  function remember() {
    const lines = body
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line, i, all) => line.length > 0 || i < all.length - 1);
    const nextChoices = choices.map((label, i) => label.trim() || karte.choices[i]);
    onPatch({
      ...patch,
      title: title.trim() || karte.title,
      lines: lines.length ? lines : karte.lines,
      choices: nextChoices,
    });
    setStatus("gemerkt (Auflage)");
  }

  const hintergrund = artSrcFor(view.art, view.artSrc);
  const hintergrundPoster = ART[view.art];
  const portrait = portraitSrcFor(view.portrait, view.portraitSrc);
  const portraitPoster = view.portrait ? PORTRAITS[view.portrait] : undefined;

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden overflow-y-auto bg-bg text-fg">
      {view.held ? (
        <Hud
          held={view.held}
          onSave={onSave}
          saveMessage={saveMessage}
          onKnowledge={onKnowledge}
          onLeiter={onLeiter}
          leiterOpen={leiterOpen}
          wissenAnzahl={wissenAnzahl}
          weltAnzahl={weltAnzahl}
          weltPunkt={weltPunkt}
          hinzu={view.seiteHinzu}
          nimmt={view.seiteNimmt}
          fort={view.seiteFort}
        />
      ) : null}
      {knowledgeOpen && view.held ? <KnowledgeJournal held={view.held} debug={debug} onClose={onKnowledge} /> : null}

      <figure className="relative m-0">
        <div className="relative h-[46vh] min-h-56 w-full overflow-hidden bg-surface sm:h-[56vh]">
          <StageMedia
            src={hintergrund}
            poster={hintergrundPoster}
            kenBurns={!isMotion(hintergrund)}
            className="size-full object-cover"
          />
          {view.held ? (
            <div className={`pointer-events-none absolute inset-0 ${tageszeitSchleier(leseTageszeit(view.held))}`} aria-hidden />
          ) : null}
          {portrait ? (
            <StageMedia
              src={portrait}
              poster={portraitPoster}
              className="absolute bottom-3 right-3 h-28 w-20 rounded-lg border border-border object-cover shadow-sm sm:h-36 sm:w-24"
            />
          ) : null}
        </div>
        <figcaption className="border-y border-border bg-ink">
          <div key={view.textKey} className="mx-auto max-w-3xl px-3 py-4 sm:px-6 sm:py-5">
            {authorMode ? (
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-fg">
                <PenLine className="size-3.5 text-accent" aria-hidden />
                Welt offen. Zeilen gelten als Auflage in diesem Browser.
              </div>
            ) : null}
            {authorMode ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={remember}
                className="mb-3 w-full rounded-sm border border-border bg-surface px-2 py-1 font-display text-xl font-semibold tracking-tight text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-2xl"
                aria-label="Kartentitel"
              />
            ) : (
              <h2 className="tafel-zeile mb-3 font-display text-xl font-semibold tracking-tight sm:text-2xl" style={{ ["--i" as string]: 0 }}>
                {view.title}
              </h2>
            )}

            {view.probe ? (
              <div className="mb-3 flex items-start gap-2 rounded-md border border-border bg-surface/80 px-3 py-2 text-sm" role="status" aria-live="polite">
                <Dices className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="tabular-nums">
                    Probe{view.probe.beschreibung ? ` (${view.probe.beschreibung})` : ""}: {probeZeile(view.probe)}
                  </p>
                  <p className={view.probe.erfolg ? "text-ok" : "text-hp"}>{view.probe.erfolg ? "Erfolg." : "Misserfolg."}</p>
                </div>
              </div>
            ) : null}

            {authorMode ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={remember}
                rows={Math.max(4, view.lines.length + 1)}
                className="w-full resize-y rounded-sm border border-border bg-ink/70 px-3 py-2 text-sm leading-relaxed text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                aria-label="Kartentext"
              />
            ) : (
              <div className="space-y-2.5 text-sm leading-relaxed text-fg sm:text-base">
                {view.lines.map((line, index) => (
                  <p key={`${index}-${line.slice(0, 24)}`} className="tafel-zeile" style={{ ["--i" as string]: Math.min(index + 1, 8) }}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {view.log?.length ? (
              <div className="mt-3 space-y-1 text-sm text-accent">
                {view.log.map((line, index) => (
                  <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>
                ))}
              </div>
            ) : null}

            {view.ending ? (
              <p className="mt-4 font-display text-lg italic text-accent sm:text-xl">Ende: {view.ending}</p>
            ) : null}

            {authorMode && status ? <p className="mt-3 text-sm text-accent">{status}</p> : null}
          </div>
        </figcaption>
      </figure>

      <div className="safe-bottom relative z-10 mx-auto grid max-w-3xl gap-2 px-3 py-3 sm:px-6 sm:py-4">
          {authorMode
            ? karte.choices.map((label, index) => (
                <div key={`edit-${index}`} className="flex items-center gap-2">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xs border border-border text-xs text-muted-fg tabular-nums">
                    {index + 1}
                  </span>
                  <input
                    value={choices[index] ?? label}
                    onChange={(e) => {
                      const next = [...choices];
                      next[index] = e.target.value;
                      setChoices(next);
                    }}
                    onBlur={remember}
                    className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-ink/70 px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Wahl ${index + 1}`}
                  />
                  <Button variant="choice" size="choice" className="w-auto shrink-0 px-3" onClick={() => onChoose(index)}>
                    Gehen
                  </Button>
                </div>
              ))
            : view.choices.map((label, index) => (
                <Button key={`${index}-${label}`} variant="choice" size="choice" onClick={() => onChoose(index)}>
                  <span className="mr-2 inline-flex size-6 shrink-0 items-center justify-center rounded-xs border border-border text-xs text-muted-fg tabular-nums">
                    {index + 1}
                  </span>
                  {label}
                </Button>
              ))}
      </div>

      {lageIndex !== null ? (
        <LageOverlay frageIndex={lageIndex} onAntwort={onLageAntwort} onSchliessen={onLageSchliessen} />
      ) : null}
    </div>
  );
}

function StageMedia({
  src,
  poster,
  className,
  kenBurns = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  kenBurns?: boolean;
}) {
  const bewegt = `${className ?? ""} ${kenBurns ? "ken-burns" : ""}`.trim();
  if (isMotion(src)) {
    return <video src={src} poster={poster} className={className} autoPlay muted loop playsInline aria-hidden />;
  }
  return <img src={src} alt="" className={bewegt} />;
}
