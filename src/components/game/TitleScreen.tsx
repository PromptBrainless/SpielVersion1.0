import {
  BookOpen,
  FolderOpen,
  Globe,
  Play,
  ScrollText,
  Settings2,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART } from "@/game/art";
import type { SaveSlotInfo } from "@/game/save";
import { setzeEinstellung } from "@/game/einstellungen";
import { useEinstellungen } from "@/game/use-einstellungen";
import { entsperreKlang, spieleKlang } from "@/game/klang";

export function TitleScreen({
  onStart,
  onRules,
  onLoad,
  onLoadName,
  canLoad,
  slots = [],
  onWelt,
  onImport,
  onSystem,
}: {
  onStart: () => void;
  onRules: () => void;
  onLoad: () => void;
  onLoadName?: (name: string) => void;
  canLoad: boolean;
  slots?: SaveSlotInfo[];
  onWelt: () => void;
  onImport?: (roh: string) => boolean;
  onSystem?: () => void;
}) {
  const { ton } = useEinstellungen();

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden overflow-y-auto bg-bg text-fg">
      <div className="vignette koernung absolute inset-0 overflow-hidden">
        <img src={ART.title} alt="" className="ken-burns size-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/25" />

      {/* Ton und Systemsteuerung bleiben auch vor dem ersten Schritt erreichbar. */}
      <div className="safe-top absolute inset-x-0 top-0 z-20 flex justify-end gap-1.5 px-4">
        <button
          type="button"
          onClick={() => {
            const an = !ton.an;
            setzeEinstellung("ton", { an });
            if (an) {
              entsperreKlang();
              window.setTimeout(() => spieleKlang("oeffnen"), 60);
            }
          }}
          className="inline-flex size-11 items-center justify-center rounded-sm border border-border bg-ink/70 text-muted-fg backdrop-blur-sm transition-colors duration-[var(--motion-quick)] hover:border-accent hover:text-fg"
          aria-pressed={ton.an}
          aria-label={ton.an ? "Ton ausschalten" : "Ton einschalten"}
          title={ton.an ? "Ton aus (M)" : "Ton an (M)"}
        >
          {ton.an ? (
            <Volume2 className="size-4" aria-hidden />
          ) : (
            <VolumeX className="size-4" aria-hidden />
          )}
        </button>
        {onSystem ? (
          <button
            type="button"
            onClick={onSystem}
            className="inline-flex size-11 items-center justify-center rounded-sm border border-border bg-ink/70 text-muted-fg backdrop-blur-sm transition-colors duration-[var(--motion-quick)] hover:border-accent hover:text-fg"
            aria-label="Einstellungen"
            title="Einstellungen (E)"
          >
            <Settings2 className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="safe-bottom relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-end px-5 pb-12 pt-16 sm:justify-center sm:pb-0">
        <p
          className="tafel-zeile mb-2 text-xs uppercase tracking-[0.28em] text-accent"
          style={{ ["--i" as string]: 0 }}
        >
          How to be a Hero
        </p>
        <h1
          className="tafel-zeile font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl"
          style={{ ["--i" as string]: 1 }}
        >
          Lindendorf
        </h1>
        <div
          className="tafel-zeile mt-3 h-px w-28 bg-gradient-to-r from-accent to-transparent"
          style={{ ["--i" as string]: 2 }}
          aria-hidden
        />
        <p
          className="tafel-zeile mt-4 max-w-md text-base text-fg/90"
          style={{ ["--i" as string]: 3 }}
        >
          Ein ausführliches Dark-Fantasy-Abenteuer über ein armes Tal, einen alten Steinbruch und
          Entscheidungen, die länger bleiben als ihre Helden. Drei Attribute, W10 und sichtbare
          Konsequenzen.
        </p>
        <div className="tafel-zeile mt-8 grid gap-2" style={{ ["--i" as string]: 4 }}>
          <Button size="lg" onClick={onStart}>
            <Play className="size-4" aria-hidden />
            Abenteuer starten
          </Button>
          {canLoad ? (
            <div className="grid gap-1.5">
              <Button variant="secondary" size="lg" onClick={onLoad}>
                <FolderOpen className="size-4" aria-hidden />
                Letzten Spielstand laden
              </Button>
              {slots.length > 1 ? (
                <div className="grid gap-1">
                  {slots.map((slot) => (
                    <Button
                      key={slot.nameKey}
                      variant="ghost"
                      className="h-9 justify-between px-3 text-xs"
                      onClick={() => onLoadName?.(slot.name)}
                    >
                      <span className="truncate">{slot.name}</span>
                      <span className="shrink-0 tabular-nums text-muted-fg">LP {slot.lp}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-muted-fg">
                  {slots[0]
                    ? `Stand von ${slots[0].name} · Fortsetzung am Dorfplatz`
                    : "Fortsetzung am Dorfplatz"}
                </p>
              )}
            </div>
          ) : null}
          <Button variant="secondary" size="lg" onClick={onRules}>
            <ScrollText className="size-4" aria-hidden />
            So wird gespielt
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="lg" onClick={onWelt}>
              <Globe className="size-4" aria-hidden />
              Weltwerkzeug
            </Button>
            {onImport ? (
              <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-base text-fg transition-colors duration-[var(--motion-quick)] hover:bg-surface-2">
                <Upload className="size-4" aria-hidden />
                Standdatei
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(event) => {
                    const datei = event.target.files?.[0];
                    event.target.value = "";
                    if (!datei) return;
                    void datei.text().then((roh) => onImport(roh));
                  }}
                />
              </label>
            ) : null}
          </div>
        </div>
        <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-fg">
          <BookOpen className="size-3.5" aria-hidden />
          Lindendorf — Dorf, Glockenweg, Wald und Steinbruch
        </p>
      </div>
    </div>
  );
}
