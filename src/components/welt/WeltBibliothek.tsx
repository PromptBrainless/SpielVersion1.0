import { useMemo, useState } from "react";
import { bibliothek } from "@/game/welt-regeln";

export function WeltBibliothek({ onSeite }: { onSeite?: (id: string) => void }) {
  const [suche, setSuche] = useState("");
  const zeilen = useMemo(() => bibliothek(), []);
  const sichtbar = zeilen.filter((z) => {
    const q = suche.trim().toLowerCase();
    if (!q) return true;
    return `${z.id} ${z.titel} ${z.quest} ${z.teil}`.toLowerCase().includes(q);
  });

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-fg">Bibliothek — {zeilen.length} Seiten. Klick öffnet Karte, nicht die Partie.</p>
      <input
        className="mt-1 h-11 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
        placeholder="Titel, Id, Quest"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
      />
      <ul className="mt-2 max-h-72 overflow-y-auto text-sm">
        {sichtbar.map((z) => (
          <li key={z.id}>
            <button type="button" className="flex w-full items-baseline justify-between gap-2 py-1 text-left" onClick={() => onSeite?.(z.id)}>
              <span>{z.titel}</span>
              <span className="shrink-0 text-xs text-muted-fg">
                {z.quest} · {z.chars} Z.
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
