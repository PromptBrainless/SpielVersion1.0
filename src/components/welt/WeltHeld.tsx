import { useState } from "react";
import { Button } from "@/components/ui/button";
import { probe } from "@/game/engine";
import { effekteDerGruppe, hatEffekt, type EffektId } from "@/game/effekte";
import { HERKUNFT_FRAGEN } from "@/game/herkunft";
import { KNOWLEDGE_META, deriveKnowledge, type KnowledgeKey, type WissensTyp } from "@/game/knowledge";
import { LEICHT, MITTEL, SCHWER, type Held } from "@/game/types";
import { leseSpieltag, leseTageszeit, TAGESZEITEN, TAGESZEIT_TEXT, zeitModifikator, type Tageszeit } from "@/game/tageszeit";
import type { ProbenAktion } from "@/game/zeitModifikatoren";
import { EffektChips } from "./EffektChips";

const TYPEN: WissensTyp[] = ["material", "sozial", "ort", "übernatürlich"];

export function WeltHeld({
  held,
  onEffekt,
  onLage,
  onTageszeit,
}: {
  held: Held | null;
  onEffekt: (id: EffektId, an: boolean) => void;
  onLage: (frageIndex: number) => void;
  onTageszeit?: (zeit: Tageszeit) => void;
}) {
  const [lage, setLage] = useState(0);
  const [probeName, setProbeName] = useState<"Stärke" | "Geschicklichkeit" | "Charisma">("Stärke");
  const [aktion, setAktion] = useState<ProbenAktion>("kaempfen");
  const [ziel, setZiel] = useState(MITTEL);
  const [nebel, setNebel] = useState(false);
  const [wurf, setWurf] = useState<string | null>(null);

  if (!held) {
    return (
      <p className="rounded-md border border-warn/50 bg-warn/15 px-3 py-2 text-sm text-warn">
        Nicht die Partie. Erst spielen, dann Gunst und Wissen anfassen.
      </p>
    );
  }

  const wissen = [...deriveKnowledge(held)].reduce<Record<WissensTyp, string[]>>(
    (acc, key) => {
      const meta = KNOWLEDGE_META[key as KnowledgeKey];
      if (meta) acc[meta.typ].push(meta.label);
      return acc;
    },
    { material: [], sozial: [], ort: [], übernatürlich: [] },
  );
  const erinnerung = new Map<string, string[]>();
  for (const eintrag of held.entscheidungen ?? []) {
    if (eintrag.typ !== "npc") continue;
    const liste = erinnerung.get(eintrag.ziel) ?? [];
    liste.push(String(eintrag.wert));
    erinnerung.set(eintrag.ziel, liste);
  }

  return (
    <div>
      <p className="mb-1 text-xs text-muted-fg">Tageszeit — Partie, Tag {leseSpieltag(held)}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TAGESZEITEN.map((id) => (
          <Button
            key={id}
            type="button"
            variant={leseTageszeit(held) === id ? "default" : "secondary"}
            className="h-9 px-2.5 text-xs"
            onClick={() => onTageszeit?.(id)}
          >
            {TAGESZEIT_TEXT[id].name}
          </Button>
        ))}
      </div>
      <p className="mb-1 text-xs text-muted-fg">Gunst — auf diesen Held</p>
      <EffektChips ids={effekteDerGruppe("gunst")} an={(id) => hatEffekt(held, id)} onToggle={onEffekt} />
      <p className="mt-2 mb-1 text-xs text-muted-fg">Last — auf diesen Held</p>
      <EffektChips ids={effekteDerGruppe("last")} an={(id) => hatEffekt(held, id)} onToggle={onEffekt} />
      <div className="mt-3 flex gap-2">
        <select
          className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-surface px-2 text-sm text-fg"
          value={lage}
          onChange={(event) => setLage(Number(event.target.value))}
        >
          {HERKUNFT_FRAGEN.map((frage, index) => (
            <option key={frage.id} value={index}>
              {frage.titel}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" className="h-11 shrink-0 px-3 text-xs" onClick={() => onLage(lage)}>
          Lage
        </Button>
      </div>
      {TYPEN.map((typ) =>
        wissen[typ].length ? (
          <div key={typ} className="mt-3">
            <p className="text-xs uppercase tracking-wide text-muted-fg">{typ}</p>
            <ul className="text-sm text-fg/90">
              {wissen[typ].map((z) => (
                <li key={z}>{z}</li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-muted-fg">Erinnerung</p>
        {erinnerung.size ? (
          [...erinnerung.entries()].map(([npc, flags]) => (
            <p key={npc} className="text-sm">
              {npc}: {flags.join(", ")}
            </p>
          ))
        ) : (
          <p className="text-xs text-muted-fg">Noch keine Figur im Log.</p>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-fg">Probe — schreibt die Partie nicht.</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {(["Stärke", "Geschicklichkeit", "Charisma"] as const).map((name) => (
          <Button key={name} variant={probeName === name ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setProbeName(name)}>
            {name}
          </Button>
        ))}
        {(
          [
            ["schleichen", "Schleichen"],
            ["verstecken", "Verstecken"],
            ["reden", "Reden"],
            ["wahrnehmung", "Wahrnehmung"],
            ["klettern", "Klettern"],
            ["kaempfen", "Kampf"],
          ] as const
        ).map(([id, label]) => (
          <Button key={id} variant={aktion === id ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setAktion(id)}>
            {label}
          </Button>
        ))}
        {[LEICHT, MITTEL, SCHWER].map((n) => (
          <Button key={n} variant={ziel === n ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setZiel(n)}>
            {n}
          </Button>
        ))}
        <Button variant={nebel ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setNebel((v) => !v)}>
          Nebel
        </Button>
        <Button
          className="h-9 px-2 text-xs"
          onClick={() => {
            const wert = probeName === "Stärke" ? held.staerke : probeName === "Geschicklichkeit" ? held.geschick : held.charisma;
            const ergebnis = probe(held, probeName, wert, ziel, "Welt", nebel ? "nebel" : undefined, aktion);
            const zeit = zeitModifikator(held, aktion);
            setWurf(
              `${ergebnis.wurf}+${ergebnis.attributWert}=${ergebnis.summe} gegen ${ergebnis.schwierigkeit} — ${ergebnis.erfolg ? "Erfolg" : "Fehlschlag"}${zeit ? ` (Zeit ${zeit > 0 ? "+" : ""}${zeit})` : ""}`,
            );
          }}
        >
          Würfeln
        </Button>
      </div>
      {wurf ? <p className="mt-2 text-sm text-accent">{wurf}</p> : null}
    </div>
  );
}
