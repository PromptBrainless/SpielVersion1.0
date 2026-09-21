import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  clearSavedGameForName,
  exportiereSpielstand,
  importiereSpielstand,
  ladeSpielstandDatei,
  leseSpielstand,
  listSavedGameDetails,
  nameKey,
} from "@/game/save";
import { WeltFiguren } from "./WeltFiguren";
import { WeltZeitstrahl } from "./WeltZeitstrahl";

export function WeltSpieler({
  aktuelleName,
  onLade,
  onGeaendert,
}: {
  aktuelleName?: string;
  onLade?: (name: string) => void;
  onGeaendert?: () => void;
}) {
  const [tick, setTick] = useState(0);
  const [wahl, setWahl] = useState<string | null>(null);
  const [loesch, setLoesch] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const slots = useMemo(() => listSavedGameDetails(), [tick]);
  const angesehen = wahl ? leseSpielstand(wahl) : null;
  const aktiv = aktuelleName ? nameKey(aktuelleName) : "";

  function refresh() {
    setTick((n) => n + 1);
    onGeaendert?.();
  }

  return (
    <section className="mb-4 rounded-md border border-border bg-surface px-3 py-3">
      <p className="font-display text-lg">Spieler</p>
      <p className="text-xs text-muted-fg">Stände auf diesem Gerät. Log, Datei, Löschen.</p>

      {slots.length === 0 ? (
        <p className="mt-2 text-sm text-muted-fg">Noch kein Stand.</p>
      ) : (
        <ul className="mt-2 grid gap-1.5">
          {slots.map((slot) => {
            const hier = slot.nameKey === aktiv;
            const offen = wahl === slot.name;
            return (
              <li key={slot.nameKey} className="rounded-sm border border-border px-2 py-2">
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-2 text-left text-sm"
                  onClick={() => setWahl(offen ? null : slot.name)}
                >
                  <span>
                    {slot.name}
                    {hier ? <span className="ml-1 text-xs text-accent">Partie</span> : null}
                    {!slot.lebend ? <span className="ml-1 text-xs text-hp">tot</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted-fg tabular-nums">
                    LP {slot.lp} · {slot.log} Taten
                  </span>
                </button>
                <p className="text-[11px] text-muted-fg">
                  {slot.savedAt ? new Date(slot.savedAt).toLocaleString("de-DE") : "ohne Datum"} · Gold {slot.gold}
                </p>
                {offen ? (
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {onLade ? (
                      <Button type="button" className="h-9 px-2 text-xs" onClick={() => onLade(slot.name)}>
                        Laden
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 px-2 text-xs"
                      onClick={() => {
                        const held = leseSpielstand(slot.name);
                        if (!held) return;
                        ladeSpielstandDatei(slot.name, exportiereSpielstand(held));
                      }}
                    >
                      Datei
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 px-2 text-xs"
                      onClick={() => setLoesch(loesch === slot.name ? null : slot.name)}
                    >
                      Löschen
                    </Button>
                  </div>
                ) : null}
                {loesch === slot.name ? (
                  <Button
                    type="button"
                    className="mt-1 h-9 w-full text-xs"
                    onClick={() => {
                      clearSavedGameForName(slot.name);
                      setLoesch(null);
                      setWahl(null);
                      setHinweis(`„${slot.name}“ ist weg.`);
                      refresh();
                    }}
                  >
                    Wirklich löschen
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <label className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md border border-border bg-bg text-sm">
        Standdatei aufnehmen
        <input
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const datei = event.target.files?.[0];
            event.target.value = "";
            if (!datei) return;
            void datei.text().then((roh) => {
              const held = importiereSpielstand(roh);
              if (!held) {
                setHinweis("Die Datei ist kein Spielstand.");
                return;
              }
              setHinweis(`„${held.name}“ liegt im Fach.`);
              setWahl(held.name);
              refresh();
            });
          }}
        />
      </label>
      {hinweis ? <p className="mt-2 text-xs text-accent">{hinweis}</p> : null}

      {angesehen ? (
        <div className="mt-3 border-t border-border pt-2">
          <p className="text-xs text-muted-fg">Ruf · {angesehen.name}</p>
          <WeltFiguren held={angesehen} />
          <p className="mt-3 text-xs text-muted-fg">Log · {angesehen.name}</p>
          <WeltZeitstrahl held={angesehen} />
        </div>
      ) : null}
    </section>
  );
}
