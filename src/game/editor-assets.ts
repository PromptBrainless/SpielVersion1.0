import { ART, LAGEN_ART, PORTRAITS } from "./art";
import type { ArtKey, PortraitKey } from "./types";

export type AssetBefund = {
  schluessel: string;
  src: string;
  ok: boolean;
  art: "bild" | "portrait" | "lage";
  erwartet: boolean;
  hinweis?: string;
};

/** Bildplan C — im Kanon genannt, noch ohne ArtKey. */
export const KANON_ERWARTUNG: Array<{ schluessel: string; art: "bild" | "portrait"; titel: string }> = [
  { schluessel: "mill-innen", art: "bild", titel: "Mühleninnenraum" },
  { schluessel: "camp-nacht", art: "bild", titel: "Steinbruch nach der Lösung, Nacht" },
  { schluessel: "ende-still", art: "bild", titel: "Stiller Sieg" },
  { schluessel: "ende-kauf", art: "bild", titel: "Gekaufter Frieden" },
  { schluessel: "ende-wunde", art: "bild", titel: "Verwundete Rückkehr" },
];

function zugewiesen(src: string | undefined): boolean {
  return Boolean(src && src !== "/art/placeholder.jpg" && !src.includes("TODO"));
}

export async function pruefeAssets(): Promise<AssetBefund[]> {
  const liste: AssetBefund[] = [
    ...Object.entries(ART).map(([schluessel, src]) => ({
      schluessel,
      src,
      art: "bild" as const,
      ok: false,
      erwartet: true,
      hinweis: zugewiesen(src) ? undefined : "im Kanon erwartet, aber kein Bild zugewiesen",
    })),
    ...Object.entries(PORTRAITS).map(([schluessel, src]) => ({
      schluessel,
      src,
      art: "portrait" as const,
      ok: false,
      erwartet: true,
      hinweis: zugewiesen(src) ? undefined : "im Kanon erwartet, aber kein Bild zugewiesen",
    })),
    ...Object.entries(LAGEN_ART).map(([schluessel, src]) => ({
      schluessel,
      src,
      art: "lage" as const,
      ok: false,
      erwartet: true,
      hinweis: zugewiesen(src) ? undefined : "Lage ohne Zeichnung",
    })),
  ];

  for (const item of KANON_ERWARTUNG) {
    const schon = liste.some((eintrag) => eintrag.schluessel === item.schluessel);
    if (schon) continue;
    const src =
      item.art === "bild" ? ART[item.schluessel as ArtKey] : PORTRAITS[item.schluessel as PortraitKey];
    liste.push({
      schluessel: item.schluessel,
      src: src ?? "",
      art: item.art,
      ok: false,
      erwartet: true,
      hinweis: `${item.titel}: im Kanon erwartet, aber kein Bild zugewiesen`,
    });
  }

  await Promise.all(
    liste.map(async (item) => {
      if (!zugewiesen(item.src)) {
        item.ok = false;
        item.hinweis ??= "im Kanon erwartet, aber kein Bild zugewiesen";
        return;
      }
      try {
        const antwort = await fetch(item.src, { method: "HEAD" });
        item.ok = antwort.ok;
        if (!antwort.ok) item.hinweis = "Link tot";
      } catch {
        item.ok = false;
        item.hinweis = "Link tot";
      }
    }),
  );
  return liste;
}
