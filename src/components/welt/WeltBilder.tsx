import { useEffect, useState } from "react";
import { ART, LAGEN_ART, PORTRAITS } from "@/game/art";
import { pruefeAssets, type AssetBefund } from "@/game/editor-assets";

export function WeltBilder() {
  const [liste, setListe] = useState<AssetBefund[] | null>(null);

  useEffect(() => {
    void pruefeAssets().then(setListe);
  }, []);

  const bilder = liste?.filter((i) => i.art === "bild") ?? [];
  const koepfe = liste?.filter((i) => i.art === "portrait") ?? [];
  const lagen = liste?.filter((i) => i.art === "lage") ?? [];
  const fehlt = liste?.filter((i) => !i.ok) ?? [];

  return (
    <section className="mt-4 rounded-md border border-border px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-fg">Bilder</p>
      <p className="mt-1 text-xs text-muted-fg">
        {liste
          ? `${liste.filter((i) => i.ok).length} da · ${fehlt.length} fehlen`
          : "Prüfe Dateien…"}
      </p>
      {fehlt.length ? (
        <ul className="mt-2 text-xs text-warn">
          {fehlt.map((i) => (
            <li key={`${i.art}-${i.schluessel}`}>
              {i.art} {i.schluessel}
              {i.hinweis ? ` — ${i.hinweis}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <Raster titel="Karten" eintraege={bilder.length ? bilder : Object.entries(ART).map(([schluessel, src]) => ({ schluessel, src, ok: true, art: "bild" as const, erwartet: true }))} />
      <Raster titel="Porträts" eintraege={koepfe.length ? koepfe : Object.entries(PORTRAITS).map(([schluessel, src]) => ({ schluessel, src, ok: true, art: "portrait" as const, erwartet: true }))} />
      <Raster titel="Lagen" eintraege={lagen.length ? lagen : Object.entries(LAGEN_ART).map(([schluessel, src]) => ({ schluessel, src, ok: true, art: "lage" as const, erwartet: true }))} />
    </section>
  );
}

function Raster({ titel, eintraege }: { titel: string; eintraege: AssetBefund[] }) {
  return (
    <div className="mt-3">
      <p className="text-xs text-subtle-fg">{titel}</p>
      <div className="mt-1 grid grid-cols-4 gap-1.5">
        {eintraege.map((item) => (
          <figure key={`${item.art}-${item.schluessel}`} className="overflow-hidden rounded-sm border border-border">
            {item.src && item.ok !== false ? (
              <img src={item.src} alt="" className="h-14 w-full object-cover" />
            ) : (
              <div className="flex h-14 items-center justify-center bg-ink text-[10px] text-warn">fehlt</div>
            )}
            <figcaption className="truncate px-1 py-0.5 text-[10px] text-muted-fg">{item.schluessel}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
