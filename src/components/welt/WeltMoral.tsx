import { useState } from "react";
import { Button } from "@/components/ui/button";
import { lageBild } from "@/game/art";
import { HERKUNFT_FRAGEN, type HerkunftPatch } from "@/game/herkunft";
import { ethikDerAntwort, SCHULE_NAME } from "@/game/ethik";
import { loescheLage, merkeLage, sichtbareHerkunft } from "@/game/welt";

export function WeltMoral() {
  const [fragen, setFragen] = useState(sichtbareHerkunft);
  const [index, setIndex] = useState(0);
  const kanon = HERKUNFT_FRAGEN[index]!;
  const frage = fragen[index] ?? kanon;
  const merkt = frage.titel !== kanon.titel || frage.geschichte.join("\n") !== kanon.geschichte.join("\n");

  function speichere(next: typeof frage) {
    const patch: HerkunftPatch = {
      titel: next.titel,
      geschichte: next.geschichte,
      antworten: next.antworten.map((a) => ({ label: a.label, mal: a.mal })),
    };
    merkeLage(kanon.id, patch);
    setFragen(sichtbareHerkunft());
  }

  function setzeGeschichte(text: string) {
    speichere({ ...frage, geschichte: text.split(/\n\s*\n/).map((z) => z.trim()).filter(Boolean) });
  }

  function setzeAntwort(i: number, feld: "label" | "mal", wert: string) {
    speichere({
      ...frage,
      antworten: frage.antworten.map((a, n) => (n === i ? { ...a, [feld]: wert } : a)),
    });
  }

  return (
    <div>
      <p className="mb-1 text-xs text-muted-fg">
        Moralfragen — Auflage, nicht die Partie. {merkt ? "gemerkt" : "Kanon"} · drei Antworten bleiben.
      </p>
      <select
        className="mb-2 h-11 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
        value={index}
        onChange={(event) => setIndex(Number(event.target.value))}
      >
        {fragen.map((item, i) => (
          <option key={item.id} value={i}>
            {i + 1}. {item.titel}
            {item.titel !== HERKUNFT_FRAGEN[i]?.titel ||
            item.geschichte.join("\n") !== HERKUNFT_FRAGEN[i]?.geschichte.join("\n")
              ? " · gemerkt"
              : ""}
          </option>
        ))}
      </select>
      {lageBild(kanon.id) ? (
        <img src={lageBild(kanon.id)} alt="" className="mb-2 h-28 w-full rounded-sm border border-border object-cover grayscale" />
      ) : null}
      <label className="mb-2 block text-xs text-muted-fg">
        Titel
        <input
          className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
          value={frage.titel}
          onChange={(event) => speichere({ ...frage, titel: event.target.value })}
        />
      </label>
      <label className="mb-2 block text-xs text-muted-fg">
        Geschichte
        <textarea
          className="mt-1 min-h-36 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm leading-relaxed text-fg"
          value={frage.geschichte.join("\n\n")}
          onChange={(event) => setzeGeschichte(event.target.value)}
        />
      </label>
      {frage.antworten.map((antwort, i) => {
        const ethik = ethikDerAntwort(kanon.id, i);
        return (
        <div key={kanon.antworten[i]?.mal ?? i} className="mb-2 rounded-sm border border-border px-2 py-2">
          <p className="text-xs text-muted-fg">Antwort {i + 1}</p>
          <textarea
            className="mt-1 min-h-16 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
            value={antwort.label}
            onChange={(event) => setzeAntwort(i, "label", event.target.value)}
          />
          <label className="mt-1 block text-xs text-muted-fg">
            Mal — „jemand, der …“
            <input
              className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
              value={antwort.mal}
              onChange={(event) => setzeAntwort(i, "mal", event.target.value)}
            />
          </label>
          {ethik ? (
            <p className="mt-1 text-xs text-muted-fg">
              {SCHULE_NAME[ethik.schule]} — {ethik.satz}
            </p>
          ) : null}
        </div>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        className="h-9 px-2 text-xs"
        onClick={() => {
          loescheLage(kanon.id);
          setFragen(sichtbareHerkunft());
        }}
      >
        Diese Geschichte auf den Kanon
      </Button>
    </div>
  );
}
