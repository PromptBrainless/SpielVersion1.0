import type { Held } from "@/game/types";

export function WeltZeitstrahl({ held }: { held: Held | null }) {
  const log = [...(held?.entscheidungen ?? [])].sort((a, b) => a.timestamp - b.timestamp);
  if (!held) return <p className="mt-3 text-sm text-muted-fg">Zeitstrahl braucht die Partie.</p>;
  if (!log.length) return <p className="mt-3 text-sm text-muted-fg">Noch kein Eintrag im Log.</p>;
  return (
    <ol className="mt-3 border-l border-border pl-3">
      {log.map((e, i) => (
        <li key={`${e.timestamp}-${e.typ}-${e.ziel}-${i}`} className="mb-2 text-sm">
          <p className="text-xs text-muted-fg">
            {new Date(e.timestamp).toLocaleString("de-DE")} · {e.typ} · {e.szeneId}
          </p>
          <p>
            {e.ziel}
            {typeof e.wert === "number" ? ` ${e.wert > 0 ? "+" : ""}${e.wert}` : e.wert !== true ? ` · ${String(e.wert)}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
