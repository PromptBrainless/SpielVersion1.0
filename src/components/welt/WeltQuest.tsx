import { useState } from "react";
import { GitBranch, Route, Sparkles } from "lucide-react";
import { WeltQuestpfad } from "./WeltQuestpfad";
import { WeltPruefgraph } from "./WeltPruefgraph";
import { WeltMoral } from "./WeltMoral";

type Unterfach = "pfade" | "fluss" | "herkunft";

const UNTERFAECHER: Array<{ id: Unterfach; name: string; Symbol: typeof Route }> = [
  { id: "pfade", name: "Pfade", Symbol: Route },
  { id: "fluss", name: "Ablauf", Symbol: GitBranch },
  { id: "herkunft", name: "Herkunft", Symbol: Sparkles },
];

/**
 * Quest-Editor — prüft Nebenquests entlang eines Testhelden (Pfade),
 * verfolgt den Hauptablauf Schritt für Schritt (Ablauf) und bearbeitet
 * die Herkunftsfragen, die jede Partie eröffnen (Herkunft).
 */
export function WeltQuest() {
  const [unterfach, setUnterfach] = useState<Unterfach>("pfade");

  return (
    <div>
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
      {unterfach === "pfade" ? <WeltQuestpfad /> : null}
      {unterfach === "fluss" ? <WeltPruefgraph /> : null}
      {unterfach === "herkunft" ? <WeltMoral /> : null}
    </div>
  );
}
