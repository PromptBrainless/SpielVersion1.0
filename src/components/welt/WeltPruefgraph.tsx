import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ART } from "@/game/art";
import { FLUSS, knoten, toteFlussKnoten, unbekannteKanten } from "@/game/editor-fluss";

export function WeltPruefgraph() {
  const [ort, setOrt] = useState("intro-weg");
  const [spur, setSpur] = useState<string[]>(["intro-weg"]);
  const aktuell = knoten(ort);
  const tot = useMemo(() => toteFlussKnoten(), []);
  const kanten = useMemo(() => unbekannteKanten(), []);

  function gehe(id: string) {
    setOrt(id);
    setSpur((s) => (s[s.length - 1] === id ? s : [...s, id]));
  }

  return (
    <section className="mt-4 rounded-md border border-border px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-fg">Prüfgraph</p>
      <p className="mt-1 text-xs text-muted-fg">
        {FLUSS.length} Orte · Übersicht, keine Partie.
        {tot.length ? ` · tot: ${tot.join(", ")}` : " · keine toten Knoten"}
        {kanten.length ? ` · offene Kanten: ${kanten.join(", ")}` : ""}
      </p>
      {aktuell?.art && ART[aktuell.art] ? (
        <img src={ART[aktuell.art]} alt="" className="mt-2 h-24 w-full rounded-sm object-cover" />
      ) : null}
      <p className="mt-2 font-display text-lg">{aktuell?.titel ?? ort}</p>
      <div className="mt-1 space-y-1 text-sm leading-relaxed">
        {(aktuell?.zeilen ?? []).map((z) => (
          <p key={z.slice(0, 40)}>{z}</p>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-fg">Weiter</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {(aktuell?.weiter ?? []).map((kante) => (
          <Button key={kante.id} variant="secondary" className="h-9 px-2 text-xs" onClick={() => gehe(kante.id)}>
            {kante.label}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-fg">Sprung</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {FLUSS.map((k) => (
          <button
            key={k.id}
            type="button"
            className={`rounded-sm border px-2 py-1 text-xs ${k.id === ort ? "border-accent text-fg" : "border-border text-muted-fg"}`}
            onClick={() => gehe(k.id)}
          >
            {k.titel}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-subtle-fg">Weg: {spur.map((id) => knoten(id)?.titel ?? id).join(" → ")}</p>
      <button type="button" className="mt-1 text-xs text-muted-fg" onClick={() => { setOrt("intro-weg"); setSpur(["intro-weg"]); }}>
        Von vorn
      </button>
    </section>
  );
}
