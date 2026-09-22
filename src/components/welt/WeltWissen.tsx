import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { merkeWissenDatei, loescheWissenDatei, wissenDatei, wissenIds } from "@/game/json/wissen";
import type { WissenTafelJson } from "@/game/json/wissen-schema";
import { ladeSpielleiterBild } from "@/game/sl-upload";
import { alsZuege } from "@/game/stimme";
import { legeWissenAb, loescheWissenAb } from "@/game/werkstatt.functions";
import { wissenBildFuer } from "@/game/wissen-tafeln";
import { StimmeFeld } from "./StimmeFeld";

export function WeltWissen({ aktuell }: { aktuell?: string }) {
  const ablegen = useServerFn(legeWissenAb);
  const streichen = useServerFn(loescheWissenAb);
  const ids = useMemo(() => {
    const liste = wissenIds();
    if (aktuell && !liste.includes(aktuell)) return [aktuell, ...liste];
    return liste;
  }, [aktuell]);
  const start = aktuell && ids.includes(aktuell) ? aktuell : (ids[0] ?? "");
  const [wahl, setWahl] = useState(start);
  const [suche, setSuche] = useState("");
  const [entwurf, setEntwurf] = useState<WissenTafelJson>(() => lade(start, aktuell));
  const [meldung, setMeldung] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!aktuell) return;
    setWahl(aktuell);
    setEntwurf(lade(aktuell, aktuell));
  }, [aktuell]);

  const sichtbar = ids.filter((id) => {
    if (!suche.trim()) return true;
    const q = suche.trim().toLocaleLowerCase("de-DE");
    const tafel = id === wahl ? entwurf : wissenDatei(id);
    return id.toLocaleLowerCase("de-DE").includes(q) || (tafel?.title ?? "").toLocaleLowerCase("de-DE").includes(q);
  });

  function waehle(id: string) {
    setWahl(id);
    setEntwurf(lade(id, aktuell));
    setMeldung(null);
  }

  async function speichern() {
    const lines = entwurf.lines.map((zeile) => zeile.trim()).filter(Boolean);
    if (!entwurf.id.trim() || !entwurf.title.trim() || !lines.length) {
      setMeldung("Titel und Text müssen stehen.");
      return;
    }
    const zuege = alsZuege(entwurf.stimmeSrc, entwurf.stimmen);
    const tafel: WissenTafelJson = {
      ...entwurf,
      id: entwurf.id.trim(),
      title: entwurf.title.trim(),
      bild: entwurf.bild.trim() || wissenBildFuer(entwurf.id),
      lines,
      stimmeSrc: zuege[0]?.src,
      stimmen: zuege.length ? zuege : undefined,
    };
    merkeWissenDatei(tafel);
    setBusy(true);
    setMeldung("legt ab…");
    try {
      const fund = await ablegen({ data: { id: tafel.id, inhalt: JSON.stringify(tafel) } });
      setMeldung(fund.ok ? `Datei ${fund.datei}` : fund.error);
    } catch (fehler) {
      setMeldung(fehler instanceof Error ? fehler.message : "Ablegen fehlgeschlagen. Liegt nur im Speicher.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(12rem,16rem)_1fr]">
      <div className="grid gap-2 self-start">
        <label className="text-xs text-muted-fg">
          Tafel
          <input
            className="mt-1 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg"
            value={suche}
            onChange={(event) => setSuche(event.target.value)}
            placeholder="suchen…"
          />
        </label>
        <ul className="max-h-[min(28rem,50vh)] overflow-y-auto rounded-sm border border-border">
          {sichtbar.map((id) => (
            <li key={id}>
              <button
                type="button"
                className={`flex h-11 w-full items-center px-3 text-left text-sm ${wahl === id ? "bg-surface-2 text-fg" : "text-muted-fg hover:text-fg"}`}
                onClick={() => waehle(id)}
              >
                <span className="truncate">{wissenDatei(id)?.title ?? id}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-3">
        <p className="text-xs text-muted-fg">
          Eine Datei je Beitrag unter json/wissen. Stimme hängt an der Tafel, nicht am Held.
        </p>
        <label className="text-xs text-muted-fg">
          Titel
          <input
            className="mt-1 h-11 w-full rounded-sm border border-border bg-surface px-3 font-display text-sm text-fg"
            value={entwurf.title}
            onChange={(event) => setEntwurf({ ...entwurf, title: event.target.value })}
          />
        </label>
        <label className="text-xs text-muted-fg">
          Text
          <textarea
            className="mt-1 min-h-36 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm leading-relaxed text-fg"
            value={entwurf.lines.join("\n")}
            onChange={(event) => setEntwurf({ ...entwurf, lines: event.target.value.split("\n") })}
          />
        </label>
        <BildFeld bild={entwurf.bild} onBild={(bild) => setEntwurf({ ...entwurf, bild })} />
        <StimmeFeld
          src={entwurf.stimmeSrc}
          stimmen={entwurf.stimmen}
          onStimmen={(stimmen) => setEntwurf({ ...entwurf, stimmen, stimmeSrc: stimmen[0]?.src ?? "" })}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="h-11 px-4" disabled={busy} onClick={() => void speichern()}>
            Tafel ablegen
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-3 text-xs"
            disabled={busy || !entwurf.id}
            onClick={() => {
              const id = entwurf.id;
              if (!id) return;
              setBusy(true);
              void streichen({ data: { id } })
                .then((fund) => {
                  loescheWissenDatei(id);
                  const rest = wissenIds().filter((item) => item !== id);
                  const naechste = rest[0] ?? aktuell ?? "";
                  setWahl(naechste);
                  setEntwurf(lade(naechste, aktuell));
                  setMeldung(fund.ok ? `${id}.json gestrichen` : fund.error);
                })
                .finally(() => setBusy(false));
            }}
          >
            Tafel streichen
          </Button>
          <span className="text-xs text-muted-fg">{entwurf.id}.json</span>
        </div>
        {meldung ? <p className="text-sm text-muted-fg">{meldung}</p> : null}
      </div>
    </div>
  );
}

function lade(id: string, aktuell?: string): WissenTafelJson {
  const datei = wissenDatei(id);
  if (datei) return { ...datei, stimmen: alsZuege(datei.stimmeSrc, datei.stimmen) };
  return {
    id,
    title: id,
    bild: wissenBildFuer(id || aktuell || "dorf-platz"),
    offen: false,
    lines: [""],
    stimmen: [],
  };
}

function BildFeld({ bild, onBild }: { bild: string; onBild: (bild: string) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  return (
    <label className="block text-xs text-muted-fg">
      Bild
      <input
        className="mt-1 w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        value={bild}
        onChange={(event) => onBild(event.target.value)}
      />
      <span className="mt-1 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-2 text-xs text-fg">
        <ImagePlus className="size-3.5" aria-hidden />
        Hochladen
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const datei = event.target.files?.[0];
            event.target.value = "";
            if (!datei) return;
            void ladeSpielleiterBild(datei)
              .then((n) => {
                onBild(n);
                setStatus("liegt auf der Tafel");
              })
              .catch((err) => setStatus(err instanceof Error ? err.message : "unlesbar"));
          }}
        />
      </span>
      {status ? <span className="ml-2 text-ok">{status}</span> : null}
    </label>
  );
}
