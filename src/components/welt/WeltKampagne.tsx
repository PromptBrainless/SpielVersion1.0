import { useState } from "react";
import { Download, LayoutGrid, Library, ListChecks, ShieldCheck } from "lucide-react";
import { WeltBibliothek } from "./WeltBibliothek";
import { WeltGraph } from "./WeltGraph";
import { WeltRegeln } from "./WeltRegeln";
import { WeltBilder } from "./WeltBilder";
import { WeltZustaende } from "./WeltZustaende";
import { baueWeltGraph } from "@/game/welt-graph";

type Unterfach = "graph" | "bibliothek" | "regeln" | "bilder" | "zustaende";

const UNTERFAECHER: Array<{ id: Unterfach; name: string; Symbol: typeof LayoutGrid }> = [
  { id: "graph", name: "Graph", Symbol: LayoutGrid },
  { id: "bibliothek", name: "Bibliothek", Symbol: Library },
  { id: "regeln", name: "Regeln", Symbol: ShieldCheck },
  { id: "bilder", name: "Bilder", Symbol: Download },
  { id: "zustaende", name: "Zustände", Symbol: ListChecks },
];

/**
 * Kampagnen-Editor — der Überblick über das ganze Werk statt einer einzelnen
 * Karte: Struktur (Graph), Register (Bibliothek), Selbstprüfung (Regeln,
 * Bilder) und das Vokabular der Zustände. Schreibt nichts von selbst — jedes
 * Unterfach öffnet höchstens eine Karte zur Bearbeitung an anderer Stelle.
 */
export function WeltKampagne({
  aktuell,
  onSeite,
}: {
  aktuell?: string;
  onSeite?: (id: string) => void;
}) {
  const [unterfach, setUnterfach] = useState<Unterfach>("graph");
  const graph = useState(() => baueWeltGraph())[0];

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-1.5 text-center">
        <Kennzahl wert={graph.knoten.length} label="Szenen" />
        <Kennzahl wert={graph.leer} label="leer" warnung={graph.leer > 0} />
        <Kennzahl wert={graph.kurz + graph.stichpunkt} label="knapp" warnung={graph.kurz + graph.stichpunkt > 0} />
      </div>
      <div className="mb-3 flex gap-1 overflow-x-auto rounded-md border border-border bg-surface/50 p-1">
        {UNTERFAECHER.map(({ id, name, Symbol }) => (
          <button
            key={id}
            type="button"
            onClick={() => setUnterfach(id)}
            aria-current={unterfach === id}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-xs transition-colors duration-[var(--motion-quick)] ${
              unterfach === id ? "bg-surface-2 text-fg" : "text-muted-fg hover:text-fg"
            }`}
          >
            <Symbol className="size-3.5" aria-hidden />
            {name}
          </button>
        ))}
      </div>
      {unterfach === "graph" ? <WeltGraph aktuell={aktuell} onPick={onSeite} /> : null}
      {unterfach === "bibliothek" ? <WeltBibliothek onSeite={onSeite} /> : null}
      {unterfach === "regeln" ? <WeltRegeln onSeite={onSeite} /> : null}
      {unterfach === "bilder" ? <WeltBilder /> : null}
      {unterfach === "zustaende" ? <WeltZustaende /> : null}
    </div>
  );
}

function Kennzahl({ wert, label, warnung }: { wert: number; label: string; warnung?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-surface/50 px-2 py-2">
      <p className={`font-display text-xl font-semibold tabular-nums ${warnung ? "text-warn" : "text-fg"}`}>{wert}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-fg">{label}</p>
    </div>
  );
}
