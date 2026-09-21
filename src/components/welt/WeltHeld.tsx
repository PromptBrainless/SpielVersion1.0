import { useState } from "react";
import { Button } from "@/components/ui/button";
import { probe } from "@/game/engine";
import { effekteDerGruppe, hatEffekt, type EffektId } from "@/game/effekte";
import { LEICHT, MITTEL, SCHWER, type Held } from "@/game/types";
import { TAGESZEITEN, TAGESZEIT_TEXT, type Tageszeit } from "@/game/tageszeit";
import { mapHeldToPlayerHud } from "@/game/gm/mapHeldToPlayerHud";
import { probeZeile } from "@/game/gm/probeZeile";
import { vorschauGmCommand } from "@/game/gm/gmCommand";
import { sichtbareHerkunft } from "@/game/welt";
import type { ProbenAktion } from "@/game/tageszeit";
import { EffektChips } from "./EffektChips";
import { WeltFiguren } from "./WeltFiguren";
import { WeltMoral } from "./WeltMoral";
import { WeltZeitstrahl } from "./WeltZeitstrahl";

export function WeltHeld({
  held,
  onEffekt,
  onLage,
  onTageszeit,
  onVorschau,
}: {
  held: Held | null;
  onEffekt: (id: EffektId, an: boolean) => void;
  onLage: (frageIndex: number) => void;
  onTageszeit?: (zeit: Tageszeit) => void;
  onVorschau?: (satz: string) => void;
}) {
  const [lage, setLage] = useState(0);
  const [probeName, setProbeName] = useState<"Stärke" | "Geschicklichkeit" | "Charisma">("Stärke");
  const [aktion, setAktion] = useState<ProbenAktion>("kaempfen");
  const [ziel, setZiel] = useState(MITTEL);
  const [nebel, setNebel] = useState(false);
  const [wurf, setWurf] = useState<string | null>(null);
  const fragen = sichtbareHerkunft();
  const hud = held ? mapHeldToPlayerHud(held) : null;

  if (!held || !hud) {
    return (
      <div>
        <p className="mb-3 text-sm text-muted-fg">Blatt und Probe brauchen eine Partie.</p>
        <LageKanon />
      </div>
    );
  }

  return (
    <div>
      <section className="rounded-md border border-border bg-surface px-3 py-3">
        <p className="font-display text-xl">{hud.name}</p>
        <p className="text-xs text-muted-fg">
          Tag {hud.spieltag} · {TAGESZEIT_TEXT[hud.tageszeit].name} · {hud.lp} LP
        </p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Stat name="ST" wert={hud.st} basis={hud.stBasis} />
          <Stat name="GE" wert={hud.ge} basis={hud.geBasis} />
          <Stat name="CH" wert={hud.ch} basis={hud.chBasis} />
        </dl>
        <p className="mt-2 text-sm">Gold {hud.gold}{hud.inventar.length ? ` · ${hud.inventar.join(", ")}` : ""}</p>
        {hud.mal ? <p className="mt-2 text-sm leading-relaxed text-fg/90">{hud.mal}</p> : null}
      </section>

      <p className="mb-1 mt-4 text-xs text-muted-fg">Tageszeit</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TAGESZEITEN.map((id) => (
          <Button
            key={id}
            type="button"
            variant={hud.tageszeit === id ? "default" : "secondary"}
            className="h-9 px-2.5 text-xs"
            onClick={() => {
              onVorschau?.(vorschauGmCommand({ art: "tageszeit", zeit: id }).satz);
              onTageszeit?.(id);
            }}
          >
            {TAGESZEIT_TEXT[id].name}
          </Button>
        ))}
      </div>

      <section className="mt-3 rounded-sm border border-border px-3 py-2">
        <p className="text-xs uppercase tracking-wide text-muted-fg">Gunst</p>
        <EffektChips
          ids={effekteDerGruppe("gunst")}
          an={(id) => hatEffekt(held, id)}
          onToggle={(id, an) => {
            onVorschau?.(vorschauGmCommand({ art: "effekt", id, an }).satz);
            onEffekt(id, an);
          }}
        />
      </section>

      <section className="mt-2 rounded-sm border border-border px-3 py-2">
        <p className="text-xs uppercase tracking-wide text-muted-fg">Last</p>
        <EffektChips
          ids={effekteDerGruppe("last")}
          an={(id) => hatEffekt(held, id)}
          onToggle={(id, an) => {
            onVorschau?.(vorschauGmCommand({ art: "effekt", id, an }).satz);
            onEffekt(id, an);
          }}
        />
      </section>

      <section className="mt-2 rounded-sm border border-border px-3 py-2">
        <p className="text-xs uppercase tracking-wide text-muted-fg">Lage</p>
        <p className="mt-1 text-xs text-muted-fg">Eine der zehn Geschichten in die Partie — nicht Gunst, nicht Last.</p>
        <div className="mt-2 flex gap-2">
          <select
            className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-surface px-2 text-sm text-fg"
            value={lage}
            onChange={(event) => setLage(Number(event.target.value))}
          >
            {fragen.map((frage, index) => (
              <option key={frage.id} value={index}>
                {frage.titel}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            className="h-11 shrink-0 px-3 text-xs"
            onClick={() => {
              onVorschau?.(vorschauGmCommand({ art: "lage", frageIndex: lage }).satz);
              onLage(lage);
            }}
          >
            Vorlegen
          </Button>
        </div>
      </section>

      {hud.wissen.length ? (
        <ul className="mt-3 text-sm text-fg/90">
          {hud.wissen.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-4 text-xs uppercase tracking-wide text-muted-fg">Figuren</p>
      <WeltFiguren held={held} />
      <p className="mt-4 text-xs uppercase tracking-wide text-muted-fg">Zeitstrahl</p>
      <WeltZeitstrahl held={held} />

      <p className="mt-4 text-xs text-muted-fg">Probe — W10 + ST/GE/CH + Mod + Nebel. Schreibt nicht.</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {(["Stärke", "Geschicklichkeit", "Charisma"] as const).map((name) => (
          <Button key={name} variant={probeName === name ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setProbeName(name)}>
            {name === "Stärke" ? "ST" : name === "Geschicklichkeit" ? "GE" : "CH"}
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
            const satz = probeZeile(ergebnis);
            setWurf(satz);
            onVorschau?.(vorschauGmCommand({
              art: "probe",
              attribut: probeName === "Stärke" ? "staerke" : probeName === "Geschicklichkeit" ? "geschick" : "charisma",
              aktion,
              schwelle: ziel as 8 | 12 | 15,
              nebel,
            }).satz);
          }}
        >
          Würfeln
        </Button>
      </div>
      {wurf ? <p className="mt-2 text-sm tabular-nums text-accent">{wurf}</p> : null}

      <LageKanon />
    </div>
  );
}

function LageKanon() {
  return (
    <details className="mt-4 rounded-sm border border-border px-3 py-2">
      <summary className="cursor-pointer text-sm text-muted-fg">Lagen — Kanon der zehn Geschichten</summary>
      <div className="mt-2">
        <WeltMoral />
      </div>
    </details>
  );
}

function Stat({ name, wert, basis }: { name: string; wert: number; basis: number }) {
  return (
    <div className="rounded-sm border border-border px-1 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-muted-fg">{name}</dt>
      <dd className="font-display text-lg tabular-nums">
        {wert}
        {wert !== basis ? <span className="ml-1 text-xs text-muted-fg">({basis})</span> : null}
      </dd>
    </div>
  );
}
