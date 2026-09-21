import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { pruefeWelt, type RegelArt } from "@/game/welt-regeln";

const LABEL: Record<RegelArt, string> = { fehler: "Fehler", warnung: "Warnung", info: "Hinweis" };

export function WeltRegeln({ onSeite }: { onSeite?: (id: string) => void }) {
  const [an, setAn] = useState(false);
  const fund = useMemo(() => (an ? pruefeWelt() : []), [an]);
  const fehler = fund.filter((f) => f.art === "fehler");
  const warnung = fund.filter((f) => f.art === "warnung");
  const info = fund.filter((f) => f.art === "info");

  function bericht() {
    const text = fund.map((f) => `[${LABEL[f.art]}] ${f.id ?? "—"} ${f.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "welt-regeln.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-fg">Regel — liest Kanon, schreibt nichts.</p>
      <div className="mt-1 flex gap-2">
        <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setAn(true)}>
          Prüfen
        </Button>
        {an ? (
          <Button type="button" variant="ghost" className="h-9 px-3 text-xs" onClick={bericht}>
            Bericht
          </Button>
        ) : null}
      </div>
      {an ? (
        <p className="mt-2 text-xs text-muted-fg">
          {fehler.length} Fehler · {warnung.length} Warnungen · {info.length} Hinweise
        </p>
      ) : null}
      {fund.map((f, i) => (
        <p key={`${f.id ?? "x"}-${i}`} className="mt-1 text-sm">
          <span className={f.art === "fehler" ? "text-hp" : f.art === "warnung" ? "text-warn" : "text-muted-fg"}>{LABEL[f.art]}</span>
          {f.id && onSeite ? (
            <button type="button" className="ml-2 underline" onClick={() => onSeite(f.id!)}>
              {f.titel ?? f.id}
            </button>
          ) : f.titel ? (
            <span className="ml-2">{f.titel}</span>
          ) : null}
          <span className="ml-2 text-fg/90">{f.text}</span>
        </p>
      ))}
    </div>
  );
}
