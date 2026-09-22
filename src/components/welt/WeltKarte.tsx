import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART, PORTRAITS } from "@/game/art";
import { ORT_EFFEKT_IDS, effekteDerGruppe, type EffektId } from "@/game/effekte";
import { ladeSpielleiterBild } from "@/game/sl-upload";
import { kanonDiff, auflageLeer, type WeltAuflage } from "@/game/welt";
import type { ArtKey, PortraitKey, SceneView } from "@/game/types";
import { FIGUR_NAME } from "@/game/stimme";
import { EffektChips } from "./EffektChips";
import { StimmeFeld } from "./StimmeFeld";

const ART_KEYS = Object.keys(ART) as ArtKey[];
const PORTRAIT_KEYS = Object.keys(PORTRAITS) as PortraitKey[];

function BildFeld({ label, src, onSrc }: { label: string; src: string; onSrc: (src: string) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  async function onFile(file: File | undefined) {
    if (!file) return;
    setStatus(null);
    try {
      onSrc(await ladeSpielleiterBild(file));
      setStatus("liegt auf der Karte");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Bild unlesbar");
    }
  }
  return (
    <label className="mb-2 block text-xs text-muted-fg">
      {label}
      <input
        className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        value={src}
        placeholder="/art/… oder https://…"
        onChange={(event) => onSrc(event.target.value)}
      />
      <span className="mt-1 flex items-center gap-2">
        <span className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-2 text-xs text-fg">
          <ImagePlus className="size-3.5" aria-hidden />
          Hochladen
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const datei = event.target.files?.[0];
              event.target.value = "";
              void onFile(datei);
            }}
          />
        </span>
        {src ? <img src={src} alt="" className="h-9 w-7 rounded-xs border border-border object-cover" /> : null}
        {status ? <span className="text-ok">{status}</span> : null}
      </span>
    </label>
  );
}

export function WeltKarte({
  szene,
  auflage,
  schluessel,
  bruechig,
  onChange,
  onReset,
  onRueckgaengig,
}: {
  szene: SceneView;
  auflage: WeltAuflage;
  schluessel: string;
  bruechig: boolean;
  onChange: (next: WeltAuflage) => void;
  onReset: () => void;
  onRueckgaengig: () => void;
}) {
  const [diffAuf, setDiffAuf] = useState(false);
  const kanon = szene.original ?? { title: szene.title, lines: szene.lines, choices: szene.choices };
  const diff = kanonDiff(kanon, auflage);
  const zeilen = (auflage.lines ?? szene.lines).join("\n\n");
  const wahlen = auflage.choices ?? szene.choices;
  const gibt = auflage.effekte ?? [];
  const nimmt = auflage.effekteFort ?? [];

  function toggle(liste: EffektId[], id: EffektId, feld: "effekte" | "effekteFort") {
    const next = liste.includes(id) ? liste.filter((item) => item !== id) : [...liste, id];
    onChange({ ...auflage, [feld]: next.length ? next : undefined });
  }

  return (
    <div>
      {bruechig ? (
        <p className="mb-2 rounded-md border border-warn/40 bg-warn/10 px-2 py-1.5 text-xs text-warn">
          Diese Karte hängt am Text, nicht an einer festen Id. Die Auflage hält nur, solange der Satz gleich bleibt.
        </p>
      ) : (
        <p className="mb-2 text-xs text-muted-fg">
          {auflageLeer(auflage) ? "Kanon" : "Auflage"}
          {szene.id ? ` · ${szene.id}` : ""}
        </p>
      )}
      <label className="mb-2 block text-xs text-muted-fg">
        Titel
        <input
          className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
          value={auflage.title ?? szene.title}
          onChange={(event) => onChange({ ...auflage, title: event.target.value })}
        />
      </label>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <label className="text-xs text-muted-fg">
          Bild
          <select
            className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
            value={auflage.art ?? szene.art}
            onChange={(event) => onChange({ ...auflage, art: event.target.value as ArtKey })}
          >
            {ART_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-fg">
          Portrait
          <select
            className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
            value={auflage.portrait === null ? "" : (auflage.portrait ?? szene.portrait ?? "")}
            onChange={(event) =>
              onChange({ ...auflage, portrait: event.target.value ? (event.target.value as PortraitKey) : null })
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
      </div>
      <BildFeld label="Text→Bild — nur Auflage" src={auflage.artSrc ?? ""} onSrc={(artSrc) => onChange({ ...auflage, artSrc })} />
      <BildFeld
        label="Portrait — nur Auflage"
        src={auflage.portraitSrc ?? ""}
        onSrc={(portraitSrc) => onChange({ ...auflage, portraitSrc })}
      />
      <StimmeFeld
        src={auflage.stimmeSrc}
        stimmen={auflage.stimmen}
        antwort={FIGUR_NAME[(auflage.portrait ?? szene.portrait) ?? ""] ?? "Antwort"}
        syncId={szene.id}
        onStimmen={(stimmen) => onChange({ ...auflage, stimmen, stimmeSrc: stimmen[0]?.src ?? "" })}
      />
      <p className="mb-1 text-xs text-muted-fg">Gunst — diese Karte gibt</p>
      <EffektChips ids={effekteDerGruppe("gunst")} an={(id) => gibt.includes(id)} onToggle={(id) => toggle(gibt, id, "effekte")} />
      <p className="mt-2 mb-1 text-xs text-muted-fg">Last — diese Karte gibt</p>
      <EffektChips ids={effekteDerGruppe("last")} an={(id) => gibt.includes(id)} onToggle={(id) => toggle(gibt, id, "effekte")} />
      <p className="mt-2 mb-1 text-xs text-muted-fg">Beim Gehen nimmt die Karte</p>
      <EffektChips ids={ORT_EFFEKT_IDS} an={(id) => nimmt.includes(id)} onToggle={(id) => toggle(nimmt, id, "effekteFort")} />
      <label className="mt-3 mb-2 block text-xs text-muted-fg">
        Text
        <textarea
          className="mt-1 min-h-28 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm leading-relaxed text-fg"
          value={zeilen}
          onChange={(event) =>
            onChange({
              ...auflage,
              lines: event.target.value
                .split(/\n\s*\n/)
                .map((line) => line.replace(/\n/g, " ").trim())
                .filter(Boolean),
            })
          }
        />
      </label>
      <p className="text-xs text-muted-fg">Wahlen — Anzahl fest</p>
      <div className="mt-1 space-y-1.5">
        {szene.choices.map((_, index) => (
          <input
            key={index}
            className="w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
            value={wahlen[index] ?? szene.choices[index]}
            onChange={(event) => {
              const next = [...(auflage.choices ?? szene.choices)];
              next[index] = event.target.value;
              onChange({ ...auflage, choices: next });
            }}
          />
        ))}
      </div>
      <button type="button" className="mt-3 text-xs text-muted-fg" onClick={() => setDiffAuf((v) => !v)}>
        {diffAuf ? "Diff zu" : "Diff: Kanon gegen Auflage"}
      </button>
      {diffAuf ? (
        <div className="mt-2 space-y-1 text-xs text-muted-fg">
          {diff.titel ? <p>Titel weicht ab.</p> : null}
          {diff.zeilen.map((z, i) => (
            <p key={i}>
              − {z.kanon || "—"}
              <br />+ {z.auflage || "—"}
            </p>
          ))}
          {diff.wahlen.map((z, i) => (
            <p key={`w${i}`}>
              Wahl − {z.kanon} / + {z.auflage}
            </p>
          ))}
          {!diff.titel && !diff.zeilen.length && !diff.wahlen.length ? <p>Kein Unterschied.</p> : null}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="h-9 px-3 text-xs" disabled={!auflage.vorherigerText} onClick={onRueckgaengig}>
          Rückgängig
        </Button>
        <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={onReset}>
          Auf Kanon
        </Button>
      </div>
      <p className="mt-2 text-xs text-subtle-fg">{schluessel}</p>
    </div>
  );
}
