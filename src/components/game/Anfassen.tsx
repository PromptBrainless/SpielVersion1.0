import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ImagePlus, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART, PORTRAITS } from "@/game/art";
import { probe } from "@/game/engine";
import { ORT_EFFEKT_IDS, effekteDerGruppe, type EffektId } from "@/game/effekte";
import { probeZeile } from "@/game/gm/probeZeile";
import { ladeSpielleiterBild } from "@/game/sl-upload";
import { LEICHT, MITTEL, SCHWER, type ArtKey, type Held, type PortraitKey, type ProbeResult } from "@/game/types";
import type { ProbenAktion } from "@/game/tageszeit";
import { TAGESZEITEN, TAGESZEIT_TEXT, type Tageszeit } from "@/game/tageszeit";
import type { KartePatch } from "@/game/welt";
import { EffektChips } from "@/components/welt/EffektChips";

const ART_KEYS = Object.keys(ART) as ArtKey[];
const PORTRAIT_KEYS = Object.keys(PORTRAITS) as PortraitKey[];
const AKTIONEN: ProbenAktion[] = ["schleichen", "verstecken", "reden", "wahrnehmung", "klettern", "kaempfen"];

export function AnfassRahmen({
  an,
  name,
  lage = "rechts",
  children,
  kasten,
}: {
  an: boolean;
  name: string;
  lage?: "rechts" | "links" | "unten";
  children: ReactNode;
  kasten: (zu: () => void) => ReactNode;
}) {
  const [offen, setOffen] = useState(false);
  const rahmen = useRef<HTMLDivElement | null>(null);
  const titelId = useId();

  useEffect(() => {
    if (!an) setOffen(false);
  }, [an]);

  useEffect(() => {
    if (!offen) return;
    function aussen(event: PointerEvent) {
      if (!rahmen.current?.contains(event.target as Node)) setOffen(false);
    }
    function taste(event: KeyboardEvent) {
      if (event.key === "Escape") setOffen(false);
    }
    window.addEventListener("pointerdown", aussen);
    window.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("pointerdown", aussen);
      window.removeEventListener("keydown", taste);
    };
  }, [offen]);

  if (!an) return <>{children}</>;

  const kastenLage =
    lage === "links"
      ? "left-2 top-10"
      : lage === "unten"
        ? "left-2 right-2 top-full z-30 mt-1"
        : "right-2 top-10";

  return (
    <div ref={rahmen} className="group/anfass relative">
      {children}
      <button
        type="button"
        className={`absolute z-[5] inline-flex size-9 items-center justify-center rounded-sm border border-accent/70 bg-ink/90 text-accent shadow-sm ${lage === "links" ? "left-2 top-2" : "right-2 top-2"}`}
        aria-expanded={offen}
        aria-controls={offen ? titelId : undefined}
        aria-label={`${name} anfassen`}
        onClick={() => setOffen((wert) => !wert)}
      >
        <PenLine className="size-3.5" aria-hidden />
      </button>
      {offen ? (
        <div
          id={titelId}
          role="dialog"
          aria-label={name}
          className={`absolute max-h-[min(24rem,70vh)] w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto rounded-md border border-border bg-bg p-3 text-fg shadow-lg ${kastenLage}`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-fg">{name}</p>
            <button type="button" className="inline-flex size-8 items-center justify-center rounded-sm text-muted-fg" onClick={() => setOffen(false)} aria-label="Schließen">
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          {kasten(() => setOffen(false))}
        </div>
      ) : null}
    </div>
  );
}

function DateiFeld({ src, onSrc }: { src: string; onSrc: (src: string) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  return (
    <label className="mt-2 block text-xs text-muted-fg">
      Datei oder Pfad
      <input
        className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        value={src}
        placeholder="/art/… oder https://…"
        onChange={(event) => onSrc(event.target.value)}
      />
      <span className="mt-1 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-2 text-xs text-fg">
        <ImagePlus className="size-3.5" aria-hidden />
        Hochladen
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const datei = event.target.files?.[0];
            event.target.value = "";
            if (!datei) return;
            void ladeSpielleiterBild(datei)
              .then((n) => {
                onSrc(n);
                setStatus("liegt auf der Karte");
              })
              .catch((err) => setStatus(err instanceof Error ? err.message : "unlesbar"));
          }}
        />
      </span>
      {status ? <span className="ml-2 text-ok">{status}</span> : null}
    </label>
  );
}

export function KastenBild({
  art,
  artSrc,
  onPatch,
}: {
  art: ArtKey;
  artSrc?: string;
  onPatch: (teil: KartePatch) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-fg">
        Ort
        <select
          className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
          value={art}
          onChange={(event) => onPatch({ art: event.target.value as ArtKey })}
        >
          {ART_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>
      <DateiFeld src={artSrc ?? ""} onSrc={(src) => onPatch({ artSrc: src })} />
    </div>
  );
}

export function KastenPortrait({
  portrait,
  portraitSrc,
  onPatch,
}: {
  portrait?: PortraitKey;
  portraitSrc?: string;
  onPatch: (teil: KartePatch) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-fg">
        Figur
        <select
          className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
          value={portrait ?? ""}
          onChange={(event) =>
            onPatch({ portrait: event.target.value ? (event.target.value as PortraitKey) : null, portraitSrc: event.target.value ? undefined : "" })
          }
        >
          <option value="">keins</option>
          {PORTRAIT_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>
      <DateiFeld src={portraitSrc ?? ""} onSrc={(src) => onPatch({ portraitSrc: src })} />
    </div>
  );
}

export function KastenText({
  title,
  lines,
  onPatch,
}: {
  title: string;
  lines: string[];
  onPatch: (teil: KartePatch) => void;
}) {
  const [titel, setTitel] = useState(title);
  const [body, setBody] = useState(lines.join("\n"));
  useEffect(() => {
    setTitel(title);
    setBody(lines.join("\n"));
  }, [title, lines]);

  function merke() {
    const next = body
      .split("\n")
      .map((zeile) => zeile.trimEnd())
      .filter((zeile, i, alle) => zeile.length > 0 || i < alle.length - 1);
    onPatch({ title: titel.trim() || title, lines: next.length ? next : lines });
  }

  return (
    <div>
      <label className="block text-xs text-muted-fg">
        Titel
        <input
          className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 font-display text-sm text-fg"
          value={titel}
          onChange={(event) => setTitel(event.target.value)}
          onBlur={merke}
        />
      </label>
      <label className="mt-2 block text-xs text-muted-fg">
        Text
        <textarea
          className="mt-1 min-h-32 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm leading-relaxed text-fg"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onBlur={merke}
        />
      </label>
    </div>
  );
}

export function KastenWahl({
  index,
  label,
  kanon,
  alle,
  onPatch,
}: {
  index: number;
  label: string;
  kanon: string[];
  alle: string[];
  onPatch: (teil: KartePatch) => void;
}) {
  return (
    <label className="block text-xs text-muted-fg">
      Wahl {index + 1}
      <input
        className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        value={label}
        onChange={(event) => {
          const next = [...alle];
          next[index] = event.target.value.trim() || kanon[index] || label;
          onPatch({ choices: next });
        }}
      />
    </label>
  );
}

export function KastenProbe({
  held,
  vorhanden,
  onProbe,
}: {
  held: Held | null | undefined;
  vorhanden?: ProbeResult;
  onProbe: (probe: ProbeResult) => void;
}) {
  const [name, setName] = useState<"Stärke" | "Geschicklichkeit" | "Charisma">("Stärke");
  const [ziel, setZiel] = useState(MITTEL);
  const [aktion, setAktion] = useState<ProbenAktion>("wahrnehmung");
  const [nebel, setNebel] = useState(false);
  if (!held) return <p className="text-sm text-muted-fg">Probe braucht die Partie.</p>;
  const wert = name === "Stärke" ? held.staerke : name === "Geschicklichkeit" ? held.geschick : held.charisma;
  return (
    <div>
      {vorhanden ? <p className="mb-2 text-xs leading-relaxed text-muted-fg">{probeZeile(vorhanden)}</p> : null}
      <div className="grid grid-cols-2 gap-1.5">
        <select className="h-9 rounded-sm border border-border bg-surface px-2 text-xs" value={name} onChange={(e) => setName(e.target.value as typeof name)}>
          <option>Stärke</option>
          <option>Geschicklichkeit</option>
          <option>Charisma</option>
        </select>
        <select className="h-9 rounded-sm border border-border bg-surface px-2 text-xs" value={ziel} onChange={(e) => setZiel(Number(e.target.value))}>
          <option value={LEICHT}>leicht {LEICHT}</option>
          <option value={MITTEL}>mittel {MITTEL}</option>
          <option value={SCHWER}>schwer {SCHWER}</option>
        </select>
        <select className="h-9 rounded-sm border border-border bg-surface px-2 text-xs" value={aktion} onChange={(e) => setAktion(e.target.value as ProbenAktion)}>
          {AKTIONEN.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <label className="flex h-9 items-center gap-1.5 text-xs">
          <input type="checkbox" checked={nebel} onChange={(e) => setNebel(e.target.checked)} />
          Nebel −2
        </label>
      </div>
      <Button
        type="button"
        className="mt-2 h-9 w-full text-xs"
        onClick={() => onProbe(probe(held, name, wert, ziel, aktion, nebel ? "nebel" : undefined, aktion))}
      >
        Würfeln
      </Button>
    </div>
  );
}

export function KastenZustande({
  gibt,
  nimmt,
  heldEffekte,
  tageszeit,
  onPatch,
  onEffekt,
  onTageszeit,
}: {
  gibt: EffektId[];
  nimmt: EffektId[];
  heldEffekte: EffektId[];
  tageszeit?: Tageszeit;
  onPatch: (teil: KartePatch) => void;
  onEffekt: (id: EffektId, an: boolean) => void;
  onTageszeit?: (zeit: Tageszeit) => void;
}) {
  function toggle(liste: EffektId[], id: EffektId, feld: "effekte" | "effekteFort") {
    const next = liste.includes(id) ? liste.filter((item) => item !== id) : [...liste, id];
    onPatch({ [feld]: next.length ? next : undefined });
  }
  return (
    <div>
      {onTageszeit && tageszeit ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {TAGESZEITEN.map((id) => (
            <Button key={id} type="button" variant={tageszeit === id ? "default" : "secondary"} className="h-8 px-2 text-xs" onClick={() => onTageszeit(id)}>
              {TAGESZEIT_TEXT[id].name}
            </Button>
          ))}
        </div>
      ) : null}
      <p className="text-xs text-muted-fg">Held jetzt</p>
      <EffektChips ids={ORT_EFFEKT_IDS} an={(id) => heldEffekte.includes(id)} onToggle={onEffekt} />
      <p className="mt-2 text-xs text-muted-fg">Diese Karte gibt</p>
      <EffektChips ids={effekteDerGruppe("gunst")} an={(id) => gibt.includes(id)} onToggle={(id) => toggle(gibt, id, "effekte")} />
      <EffektChips ids={effekteDerGruppe("last")} an={(id) => gibt.includes(id)} onToggle={(id) => toggle(gibt, id, "effekte")} />
      <p className="mt-2 text-xs text-muted-fg">Beim Gehen nimmt sie</p>
      <EffektChips ids={ORT_EFFEKT_IDS} an={(id) => nimmt.includes(id)} onToggle={(id) => toggle(nimmt, id, "effekteFort")} />
    </div>
  );
}
