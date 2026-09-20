import { BookOpen, FolderOpen, Globe, Play, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART } from "@/game/art";

export function TitleScreen({
  onStart,
  onRules,
  onLoad,
  canLoad,
}: {
  onStart: () => void;
  onRules: () => void;
  onLoad: () => void;
  canLoad: boolean;
}) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden overflow-y-auto bg-bg text-fg">
      <img src={ART.title} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/25" />
      <div className="safe-bottom relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-end px-5 pb-12 pt-16 sm:justify-center sm:pb-0">
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-accent">How to be a Hero</p>
        <h1 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
          Lindendorf
        </h1>
        <p className="mt-4 max-w-md text-base text-fg/90">
          Ein ausführliches Dark-Fantasy-Abenteuer über ein armes Tal, einen alten Steinbruch und
          Entscheidungen, die länger bleiben als ihre Helden. Drei Attribute, W10 und sichtbare
          Konsequenzen.
        </p>
        <div className="mt-8 grid gap-2">
          <Button size="lg" onClick={onStart}>
            <Play className="size-4" aria-hidden />
            Abenteuer starten
          </Button>
          {canLoad ? (
            <div className="grid gap-1.5">
              <Button variant="secondary" size="lg" onClick={onLoad}>
                <FolderOpen className="size-4" aria-hidden />
                Spielstand laden
              </Button>
              <p className="text-center text-xs text-muted-fg">Fortsetzung am Dorfplatz</p>
            </div>
          ) : null}
          <Button variant="secondary" size="lg" onClick={onRules}>
            <ScrollText className="size-4" aria-hidden />
            Kurzregeln lesen
          </Button>
          <a
            href="/editor"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-4 text-sm text-fg"
          >
            <Globe className="size-4" aria-hidden />
            Weltwerkzeug
          </a>
        </div>
        <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-fg">
          <BookOpen className="size-3.5" aria-hidden />
          Lindendorf — Dorf, Glockenweg, Wald und Steinbruch
        </p>
      </div>
    </div>
  );
}
