import { rufListe } from "@/game/reputation";
import type { Held } from "@/game/types";

export function WeltFiguren({ held }: { held: Held | null }) {
  if (!held) return <p className="mt-3 text-sm text-muted-fg">Ruf braucht die Partie.</p>;
  const liste = rufListe(held);
  if (!liste.length) return <p className="mt-3 text-sm text-muted-fg">Noch kein Ruf im Log.</p>;
  return (
    <ul className="mt-3 text-sm">
      {liste.map((item) => (
        <li key={item.ziel} className="flex justify-between gap-2">
          <span>{item.ziel}</span>
          <span className={item.wert < 0 ? "text-hp" : "text-ok"}>{item.wert > 0 ? `+${item.wert}` : item.wert}</span>
        </li>
      ))}
    </ul>
  );
}
