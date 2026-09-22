import { useEffect, useRef, useState } from "react";
import { ATTRIBUT } from "@/game/attribute";
import { EFFEKTE, effektDifferenz, heldEffekte, werteMitEffekt } from "@/game/effekte";
import type { Held } from "@/game/types";

function Stat({
  label,
  basis,
  wert,
}: {
  label: string;
  basis: number;
  wert: number;
}) {
  const delta = wert - basis;
  const farbe = delta > 0 ? "text-ok" : delta < 0 ? "text-hp" : "text-fg";
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" title={`Grundwert ${basis}`}>
      <span className="text-muted-fg">{label}</span>
      <span className={farbe}>{wert}</span>
      {delta !== 0 ? (
        <span className={`text-xs ${farbe}`}>{delta > 0 ? `+${delta}` : delta}</span>
      ) : null}
    </span>
  );
}

export function ZustandLeiste({ held, nurWerte = false }: { held: Held; nurWerte?: boolean }) {
  const werte = werteMitEffekt(held);
  const liste = heldEffekte(held);
  const schluessel = liste.join(",");
  const vorher = useRef<string | null>(null);
  const [meldung, setMeldung] = useState<string | null>(null);

  useEffect(() => {
    if (vorher.current === null) {
      vorher.current = schluessel;
      return;
    }
    const alt = vorher.current.split(",").filter(Boolean);
    const neu = schluessel.split(",").filter(Boolean);
    const { hinzu, fort } = effektDifferenz(alt, neu);
    vorher.current = schluessel;
    if (!hinzu.length && !fort.length) return;
    const teile = [
      ...hinzu.map((id) => `${EFFEKTE[id].name} ${EFFEKTE[id].hint}`),
      ...fort.map((id) => `${EFFEKTE[id].name} legt sich`),
    ];
    setMeldung(teile.join(" · "));
    const timer = window.setTimeout(() => setMeldung(null), 2800);
    return () => window.clearTimeout(timer);
  }, [schluessel]);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-fg">
        <Stat label={ATTRIBUT.staerke.kurz} basis={held.staerke} wert={werte.staerke} />
        <Stat label={ATTRIBUT.geschick.kurz} basis={held.geschick} wert={werte.geschick} />
        <Stat label={ATTRIBUT.charisma.kurz} basis={held.charisma} wert={werte.charisma} />
      </div>
      {nurWerte ? null : (
        <>
          {liste.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {liste.map((id) => {
                const item = EFFEKTE[id];
                const gunst = item.gruppe === "gunst";
                return (
                  <span
                    key={id}
                    title={item.hint}
                    className={`rounded-xs border px-1.5 py-0.5 text-xs ${
                      gunst ? "border-ok/40 text-ok" : "border-hp/40 text-hp"
                    }`}
                  >
                    {item.name}
                  </span>
                );
              })}
            </div>
          ) : null}
          {meldung ? (
            <p className="mt-1 text-xs text-accent" role="status" aria-live="polite">
              {meldung}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
