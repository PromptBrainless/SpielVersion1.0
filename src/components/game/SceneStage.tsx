import { Dices, PenLine, RotateCcw, Undo2, Volume2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ART, PORTRAITS, artSrcFor, isMotion, portraitSrcFor } from "@/game/art";
import { probeZeile } from "@/game/gm/probeZeile";
import type { KartePatch } from "@/game/welt";
import type { EffektId, ProbeResult, SceneView } from "@/game/types";
import { leseTageszeit, tageszeitSchleier, type Tageszeit } from "@/game/tageszeit";
import { useEinstellungen } from "@/game/use-einstellungen";
import { spieleKlang } from "@/game/klang";
import { FIGUR_NAME, spieleStimmen, stoppeStimme, stimmenListe } from "@/game/stimme";
import { StimmeFeld } from "@/components/welt/StimmeFeld";
import {
  AnfassRahmen,
  KastenBild,
  KastenPortrait,
  KastenProbe,
  KastenText,
  KastenWahl,
  KastenZustande,
} from "./Anfassen";
import { Hud } from "./Hud";
import { KnowledgeJournal } from "./KnowledgeJournal";
import { LageOverlay } from "./LageOverlay";

export function SceneStage({
  view,
  original,
  onChoose,
  onSystem,
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
  onLageVorlegen: _onLageVorlegen,
  lageIndex,
  onLageAntwort,
  onLageSchliessen,
  onRueckgaengig,
  onTageszeit,
  onProbe,
  wissenAnzahl,
  weltAnzahl,
  weltPunkt,
}: {
  view: SceneView;
  original: SceneView;
  onChoose: (index: number) => void;
  onSystem?: () => void;
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
  onProbe?: (ergebnis: ProbeResult) => void;
  wissenAnzahl: number;
  weltAnzahl: number;
  weltPunkt: boolean;
}) {
  const karte = view.original ?? {
    title: original.title,
    lines: original.lines,
    choices: original.choices,
  };
  const { spiel } = useEinstellungen();
  const an = authorMode && leiterOpen;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (leiterOpen) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.tagName === "SELECT")) return;
      const n = Number(event.key);
      if (spiel.ziffernwahl && n >= 1 && n <= view.choices.length) onChoose(n - 1);
      if (event.key === "Enter" && view.choices.length === 1 && !an) onChoose(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [an, leiterOpen, onChoose, spiel.ziffernwahl, view.choices.length]);

  const zuege = stimmenListe(view.stimmeSrc, view.stimmen);
  useEffect(() => {
    spieleStimmen(zuege);
    return () => stoppeStimme();
  }, [view.id, zuege.join("|")]);

  function merke(teil: KartePatch) {
    onPatch({ ...patch, ...teil });
  }

  const hintergrund = artSrcFor(view.art, view.artSrc, view.id);
  const hintergrundPoster = ART[view.art];
  const portrait = portraitSrcFor(view.portrait, view.portraitSrc);
  const portraitPoster = view.portrait ? PORTRAITS[view.portrait] : undefined;
  const wahlen = patch.choices ?? view.choices;

  return (
    <div className="relative isolate min-h-dvh bg-bg text-fg">
      {view.held ? (
        <Hud
          held={view.held}
          onSave={onSave}
          saveMessage={saveMessage}
          onKnowledge={onKnowledge}
          onLeiter={onLeiter}
          onSystem={onSystem}
          leiterOpen={leiterOpen}
          wissenAnzahl={wissenAnzahl}
          weltAnzahl={weltAnzahl}
          weltPunkt={weltPunkt}
          hinzu={view.seiteHinzu}
          nimmt={view.seiteNimmt}
          fort={view.seiteFort}
        />
      ) : null}
      {knowledgeOpen && view.held ? (
        <KnowledgeJournal held={view.held} debug={debug} onClose={onKnowledge} />
      ) : null}

      <figure className="relative m-0">
        <AnfassRahmen
          an={an}
          name="Bild"
          lage="links"
          kasten={() => <KastenBild art={view.art} artSrc={view.artSrc} onPatch={merke} />}
        >
          <div className="buehne vignette koernung relative w-full overflow-hidden bg-surface">
            <StageMedia
              src={hintergrund}
              poster={hintergrundPoster}
              kenBurns={!isMotion(hintergrund)}
              className="size-full object-cover"
            />
            {view.held ? (
              <div
                className={`buehne-schleier pointer-events-none absolute inset-0 ${tageszeitSchleier(leseTageszeit(view.held))}`}
                aria-hidden
              />
            ) : null}
            <div className="absolute bottom-3 right-3 z-[2]">
              <AnfassRahmen
                an={an}
                name="Portrait"
                kasten={() => (
                  <KastenPortrait portrait={view.portrait} portraitSrc={view.portraitSrc} onPatch={merke} />
                )}
              >
                {portrait ? (
                  <StageMedia
                    src={portrait}
                    poster={portraitPoster}
                    className="herein h-28 w-20 rounded-lg border border-border object-cover shadow-lg sm:h-36 sm:w-24"
                  />
                ) : an ? (
                  <div className="flex h-28 w-20 items-center justify-center rounded-lg border border-dashed border-border bg-ink/50 text-[10px] text-muted-fg sm:h-36 sm:w-24">
                    Portrait
                  </div>
                ) : null}
              </AnfassRahmen>
            </div>
          </div>
        </AnfassRahmen>
        <figcaption className="border-y border-border bg-ink">
          <div key={view.textKey} className="mx-auto max-w-3xl px-3 py-4 sm:px-6 sm:py-5">
            {an ? (
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-fg">
                <PenLine className="size-3.5 text-accent" aria-hidden />
                Welt offen. Stift greift die Bühne, merkt Auflage.
                {schluessel ? <span className="text-fg/80">· {schluessel}</span> : null}
                <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={onRueckgaengig}>
                  <Undo2 className="size-3.5" aria-hidden />
                  Zurück
                </Button>
                <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={onResetKarte}>
                  <RotateCcw className="size-3.5" aria-hidden />
                  Kanon
                </Button>
              </div>
            ) : null}

            <AnfassRahmen
              an={an}
              name="Text"
              lage="unten"
              kasten={() => (
                <div className="grid gap-3">
                  <KastenText title={view.title} lines={view.lines} onPatch={merke} />
                  <StimmeFeld
                    src={view.stimmeSrc}
                    stimmen={view.stimmen}
                    antwort={view.portrait ? FIGUR_NAME[view.portrait] ?? "Antwort" : "Antwort"}
                    syncId={view.id}
                    onStimmen={(stimmen) => merke({ stimmen, stimmeSrc: stimmen[0]?.src ?? "" })}
                  />
                </div>
              )}
            >
              <h2
                className="tafel-zeile mb-3 font-display text-xl font-semibold tracking-tight sm:text-2xl"
                style={{ ["--i" as string]: 0 }}
              >
                {view.title}
              </h2>
              {stimmenListe(view.stimmeSrc, view.stimmen).length ? (
                <button
                  type="button"
                  className="mb-3 inline-flex h-11 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-xs text-fg"
                  onClick={() => spieleStimmen(stimmenListe(view.stimmeSrc, view.stimmen))}
                >
                  <Volume2 className="size-3.5 text-accent" aria-hidden />
                  {stimmenListe(view.stimmeSrc, view.stimmen).length > 1 ? "Gespräch noch einmal" : "Stimme noch einmal"}
                </button>
              ) : null}
              <div className="space-y-2.5 text-sm leading-relaxed text-fg sm:text-base">
                {view.lines.map((line, index) => (
                  <p
                    key={`${index}-${line.slice(0, 24)}`}
                    className="tafel-zeile"
                    style={{ ["--i" as string]: Math.min(index + 1, 8) }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </AnfassRahmen>

            <div className="mt-3">
              <AnfassRahmen
                an={an}
                name="Probe"
                lage="unten"
                kasten={() =>
                  onProbe ? <KastenProbe held={view.held} vorhanden={view.probe} onProbe={onProbe} /> : <p className="text-sm text-muted-fg">Keine Probe.</p>
                }
              >
                {view.probe ? (
                  <div
                    className="mb-1 flex items-start gap-2 rounded-md border border-border bg-surface/80 px-3 py-2 text-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <Dices className="wuerfel-zittern mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <div>
                      <p className="tabular-nums">
                        Probe{view.probe.beschreibung ? ` (${view.probe.beschreibung})` : ""}
                        {spiel.probeErklaeren ? `: ${probeZeile(view.probe)}` : ""}
                      </p>
                      <p className={view.probe.erfolg ? "text-ok" : "text-hp"}>
                        {view.probe.erfolg ? "Erfolg." : "Misserfolg."}
                      </p>
                    </div>
                  </div>
                ) : an ? (
                  <p className="text-xs text-muted-fg">Keine Probe auf dieser Karte. Stift legt eine.</p>
                ) : null}
              </AnfassRahmen>
            </div>

            {an ? (
              <div className="mt-3">
                <AnfassRahmen
                  an
                  name="Zustände"
                  lage="unten"
                  kasten={() => (
                    <KastenZustande
                      gibt={(patch.effekte as EffektId[] | undefined) ?? []}
                      nimmt={(patch.effekteFort as EffektId[] | undefined) ?? []}
                      heldEffekte={view.held?.effekte ?? []}
                      tageszeit={view.held ? leseTageszeit(view.held) : undefined}
                      onPatch={merke}
                      onEffekt={onEffekt}
                      onTageszeit={onTageszeit}
                    />
                  )}
                >
                  <p className="text-xs text-muted-fg">Gunst, Last, Tageszeit — Stift.</p>
                </AnfassRahmen>
              </div>
            ) : null}

            {view.log?.length ? (
              <div className="mt-3 space-y-1 text-sm text-accent">
                {view.log.map((line, index) => (
                  <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>
                ))}
              </div>
            ) : null}

            {view.ending ? (
              <p className="mt-4 font-display text-lg italic text-accent sm:text-xl">
                Ende: {view.ending}
              </p>
            ) : null}
          </div>
        </figcaption>
      </figure>

      <div className="safe-bottom relative z-10 mx-auto grid max-w-3xl gap-2 px-3 py-3 sm:px-6 sm:py-4">
        {view.choices.map((label, index) => (
          <div key={`${index}-${label}`} className="flex items-stretch gap-2">
            {an ? (
              <AnfassRahmen
                an
                name={`Wahl ${index + 1}`}
                lage="unten"
                kasten={() => (
                  <KastenWahl index={index} label={wahlen[index] ?? label} kanon={karte.choices} alle={wahlen} onPatch={merke} />
                )}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-xs border border-border text-xs text-muted-fg tabular-nums">
                  {index + 1}
                </span>
              </AnfassRahmen>
            ) : null}
            <Button
              variant="choice"
              size="choice"
              className="wahlfeld tafel-zeile min-w-0 flex-1"
              style={{ ["--i" as string]: Math.min(index + 2, 9) }}
              onPointerEnter={() => spieleKlang("zeiger")}
              onClick={() => onChoose(index)}
            >
              {spiel.tastenhinweise ? (
                <span className="wahl-ziffer mr-2 inline-flex size-6 shrink-0 items-center justify-center rounded-xs border border-border text-xs text-muted-fg tabular-nums">
                  {index + 1}
                </span>
              ) : null}
              {wahlen[index] ?? label}
            </Button>
          </div>
        ))}
      </div>

      {lageIndex !== null ? (
        <LageOverlay
          frageIndex={lageIndex}
          onAntwort={onLageAntwort}
          onSchliessen={onLageSchliessen}
        />
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
    return (
      <video
        src={src}
        poster={poster}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
    );
  }
  return <img src={src} alt="" className={bewegt} />;
}