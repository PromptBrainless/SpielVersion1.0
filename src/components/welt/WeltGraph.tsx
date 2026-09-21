import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fundFuerSzene } from "@/game/json/baum";
import { baueWeltGraph, type GraphKnoten } from "@/game/welt-graph";

const FARBE = {
  fg: "#efe6d6",
  muted: "#9a917f",
  subtle: "#6f685a",
  surface: "#221f1a",
  ink: "#12110e",
  border: "#3a352c",
  hp: "#b54a3a",
  warn: "#b07a48",
};

function strich(k: GraphKnoten, aktuell: boolean) {
  if (aktuell) return FARBE.fg;
  if (k.leer) return FARBE.hp;
  if (k.stichpunkt || k.kurz) return FARBE.warn;
  return FARBE.border;
}

export function WeltGraph({ aktuell, onPick }: { aktuell?: string; onPick?: (id: string) => void }) {
  const graph = useMemo(() => baueWeltGraph(), []);
  const [wahl, setWahl] = useState<string | null>(aktuell ?? null);
  const knoten = graph.knoten.find((k) => k.id === wahl);
  const fund = knoten ? fundFuerSzene(knoten.id) : null;
  const questTitel = [...new Map(graph.knoten.map((k) => [k.quest, k] as const)).values()];

  return (
    <div>
      <p className="text-xs text-muted-fg">
        Netz · {graph.knoten.length} Seiten · {graph.leer} leer · {graph.kurz} kurz
        {graph.stichpunkt ? ` · ${graph.stichpunkt} Stichpunkt` : ""}
      </p>
      <p className="mt-1 text-xs text-subtle-fg">Tippe eine Seite. Sie bleibt hier, bis du sie auf die Karte holst.</p>
      <div className="mt-2 overflow-x-auto rounded-sm border border-border bg-ink">
        <svg
          width={graph.breite}
          height={graph.hoehe}
          viewBox={`0 0 ${graph.breite} ${graph.hoehe}`}
          className="block min-w-full"
          role="img"
          aria-label="Questgraph"
        >
          {questTitel.map((k) => (
            <text key={k.quest} x={k.x} y={22} fill={FARBE.muted} fontSize="12" fontFamily="ui-sans-serif, system-ui">
              {k.questTitel}
            </text>
          ))}
          {graph.kanten.map((kante) => {
            const a = graph.knoten.find((k) => k.id === kante.von);
            const b = graph.knoten.find((k) => k.id === kante.nach);
            if (!a || !b) return null;
            return (
              <line
                key={`${kante.von}-${kante.nach}`}
                x1={a.x + 72}
                y1={a.y + 12}
                x2={b.x + 72}
                y2={b.y}
                stroke={FARBE.border}
                strokeWidth="1"
              />
            );
          })}
          {graph.knoten.map((k) => {
            const hier = k.id === wahl || k.id === aktuell;
            return (
              <g key={k.id} transform={`translate(${k.x} ${k.y})`} className="cursor-pointer" onClick={() => setWahl(k.id)}>
                <rect
                  width="144"
                  height="28"
                  rx="3"
                  fill={hier ? FARBE.surface : FARBE.ink}
                  stroke={strich(k, hier)}
                  strokeWidth={hier ? 2 : 1}
                />
                <text x="8" y="18" fill={FARBE.fg} fontSize="11" fontFamily="ui-sans-serif, system-ui">
                  {k.titel.length > 22 ? `${k.titel.slice(0, 21)}…` : k.titel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {knoten ? (
        <div className="mt-2 rounded-sm border border-border px-3 py-2">
          <p className="font-display text-base">{knoten.titel}</p>
          <p className="text-xs text-muted-fg">
            {knoten.questTitel} · {knoten.teilTitel} · {knoten.chars} Zeichen
            {knoten.leer ? " · leer" : knoten.kurz ? " · kurz" : ""}
            {knoten.stichpunkt ? " · Stichpunkt" : ""}
          </p>
          {fund?.szene.lines.slice(0, 2).map((zeile) => (
            <p key={zeile.slice(0, 40)} className="mt-1 text-sm leading-relaxed text-fg">
              {zeile}
            </p>
          ))}
          {onPick ? (
            <Button type="button" className="mt-2 h-9 px-3 text-xs" onClick={() => onPick(knoten.id)}>
              Diese Karte öffnen
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-fg">Eine Seite antippen — der Text erscheint hier.</p>
      )}
    </div>
  );
}
