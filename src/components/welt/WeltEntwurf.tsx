import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import type { SceneView } from "@/game/types";
import { auflageLeer, type WeltAuflage } from "@/game/welt";
import { vorschauGmCommand } from "@/game/gm/gmCommand";
import { formuliereText, legeKiSzeneAb } from "@/game/werkstatt.functions";
import { StimmeFeld } from "./StimmeFeld";

export function WeltEntwurf({
  szene,
  auflage,
  schluessel = "",
  onChange,
}: {
  szene: SceneView | null;
  auflage?: WeltAuflage;
  schluessel?: string;
  onChange?: (next: WeltAuflage) => void;
}) {
  const rufen = useServerFn(formuliereText);
  const ablegen = useServerFn(legeKiSzeneAb);
  const [eingabe, setEingabe] = useState("");
  const [ausgabe, setAusgabe] = useState("");
  const [hinweis, setHinweis] = useState("");
  const [busy, setBusy] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const stand = auflage && !auflageLeer(auflage) ? "Auflage" : "Kanon";

  useEffect(() => {
    if (!szene) return;
    setEingabe(szene.lines.filter((zeile) => zeile.trim()).join("\n\n"));
    setAusgabe("");
    setMeldung(null);
  }, [szene?.id, szene?.textKey]);

  async function formulieren() {
    if (busy || !eingabe.trim()) return;
    setBusy(true);
    setMeldung("Grok formuliert…");
    try {
      const fund = await rufen({
        data: {
          text: eingabe,
          hinweis,
          title: szene?.title ?? "",
          art: szene?.art ?? "",
        },
      });
      if (!fund.ok) {
        setMeldung(fund.error);
        return;
      }
      setAusgabe(fund.text);
      setMeldung("Vorschlag bereit. Noch nicht auf der Karte.");
    } catch (fehler) {
      setMeldung(fehler instanceof Error ? fehler.message : "xAI nicht erreichbar.");
    } finally {
      setBusy(false);
    }
  }

  function zeilenAus(text: string) {
    return text
      .split(/\n\s*\n/)
      .map((zeile) => zeile.trim())
      .filter(Boolean);
  }

  async function alsAuflage() {
    if (!ausgabe.trim() || !szene || busy) return;
    const lines = zeilenAus(ausgabe);
    if (!lines.length) return;
    const patch: WeltAuflage = {
      title: szene.title,
      lines,
      choices: szene.choices,
      art: szene.art,
      portrait: szene.portrait ?? null,
    };
    const vorschau = vorschauGmCommand({ art: "auflage", schluessel: schluessel || szene.id || szene.title, patch });
    setBusy(true);
    setMeldung(`${vorschau.satz}. Schreibt die Heldensicht nicht.`);
    onChange?.(patch);
    try {
      const fund = await ablegen({
        data: {
          id: szene.id ?? "",
          inhalt: JSON.stringify({
            id: szene.id ?? "szene",
            title: szene.title,
            art: szene.art,
            portrait: szene.portrait ?? null,
            lines,
            choices: szene.choices,
          }),
        },
      });
      if (!fund.ok) {
        setMeldung(`Auflage gemerkt. Datei: ${fund.error}`);
        return;
      }
      setMeldung(`Auflage in ${fund.datei}.`);
    } catch (fehler) {
      setMeldung(fehler instanceof Error ? fehler.message : "Ablegen fehlgeschlagen. Auflage bleibt auf der Karte.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-fg">{stand} · Stimme legt nur Auflage, keinen Held-State.</p>
      <StimmeFeld
        src={auflage?.stimmeSrc ?? szene?.stimmeSrc}
        stimmen={auflage?.stimmen ?? szene?.stimmen}
        syncId={szene?.id}
        onStimmen={(stimmen) => {
          if (!szene) return;
          onChange?.({ ...(auflage ?? {}), stimmen, stimmeSrc: stimmen[0]?.src ?? "" });
        }}
      />
      <p className="text-sm text-muted-fg">Grok schreibt die Szene weiter. Legen speichert als Auflage. Den gesprochenen Text nimmst du selbst auf.</p>
      <label className="text-xs text-muted-fg">
        Hinweis (optional)
        <input
          value={hinweis}
          onChange={(event) => setHinweis(event.target.value)}
          className="mt-1 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg"
          placeholder="z. B. mehr Geruch, das Kind im Bild, Dennek nicht auslassen"
        />
      </label>
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="text-xs text-muted-fg">
          Eingabe
          <textarea
            value={eingabe}
            onChange={(event) => setEingabe(event.target.value)}
            rows={14}
            className="mt-1 w-full resize-y rounded-sm border border-border bg-ink/70 px-3 py-2 text-sm leading-relaxed text-fg"
          />
        </label>
        <label className="text-xs text-muted-fg">
          Ausgabe
          <textarea
            value={ausgabe}
            onChange={(event) => setAusgabe(event.target.value)}
            rows={14}
            className="mt-1 w-full resize-y rounded-sm border border-border bg-ink/70 px-3 py-2 text-sm leading-relaxed text-fg"
            placeholder="Hier erscheint die Formulierung."
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="h-11 px-4" disabled={busy || !eingabe.trim()} onClick={() => void formulieren()}>
          {busy ? "Grok arbeitet…" : "Formulieren"}
        </Button>
        <Button type="button" variant="secondary" className="h-11 px-4" disabled={!szene} onClick={() => szene && setEingabe(szene.lines.join("\n\n"))}>
          Text der Karte
        </Button>
        <Button type="button" className="h-11 px-4" disabled={!ausgabe.trim() || !szene || busy} onClick={() => void alsAuflage()}>
          Als Auflage legen
        </Button>
      </div>
      {meldung ? <p className="text-xs text-muted-fg">{meldung}</p> : null}
    </div>
  );
}
