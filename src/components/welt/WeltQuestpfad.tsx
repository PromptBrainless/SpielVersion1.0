import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { QUEST_PFADE, probePfad } from "@/game/editor-quests";

export function WeltQuestpfad() {
  const [id, setId] = useState(QUEST_PFADE[0]!.id);
  const reihen = useMemo(() => {
    const map = new Map<string, typeof QUEST_PFADE>();
    for (const pfad of QUEST_PFADE) {
      const liste = map.get(pfad.reihe) ?? [];
      liste.push(pfad);
      map.set(pfad.reihe, liste);
    }
    return [...map.entries()];
  }, []);
  const fund = useMemo(() => probePfad(id), [id]);
  const pfad = QUEST_PFADE.find((p) => p.id === id);

  return (
    <section className="mt-4 rounded-md border border-border px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-fg">Questpfad</p>
      <p className="mt-1 text-xs text-muted-fg">
        Testheld mit Auftrag. Legt den Weg, schreibt die Partie nicht.
      </p>
      {reihen.map(([reihe, liste]) => (
        <div key={reihe} className="mt-3">
          <p className="text-xs text-subtle-fg">{reihe}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {liste.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={id === item.id ? "default" : "secondary"}
                className="h-9 px-2 text-xs"
                onClick={() => setId(item.id)}
              >
                {item.titel}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-3 rounded-sm border border-border px-3 py-2">
        <p className="font-display text-base">{pfad?.titel}</p>
        <p className="text-xs text-muted-fg">
          Wissen {fund.wissen.length} · sicher {fund.sicher.length} · offen {fund.offen.length}
        </p>
        {fund.sicher.length ? (
          <ul className="mt-2 space-y-1 text-sm text-ok">
            {fund.sicher.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-fg">Kein sicherer Journal-Satz auf diesem Weg.</p>
        )}
        {fund.offen.length ? (
          <ul className="mt-2 space-y-1 text-sm text-muted-fg">
            {fund.offen.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
