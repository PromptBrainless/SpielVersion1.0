import { ART, PORTRAITS } from "./art";
import { QUESTS } from "./json/baum";
import type { SzeneJson } from "./json/schema";
import { pruefeSzeneBild, pruefeSzeneText, type SzenenMangel } from "./pruefung-text";
import type { ArtKey, PortraitKey } from "./types";

export { istStichpunkt, pruefeSzeneBild, pruefeSzeneText, zeilenMass } from "./pruefung-text";
export type { MangelArt, SzenenMangel } from "./pruefung-text";

const ART_KEYS = new Set(Object.keys(ART));
const PORTRAIT_KEYS = new Set(Object.keys(PORTRAITS));

export function alleSzenen(quests = QUESTS) {
  const liste: { quest: string; szene: SzeneJson }[] = [];
  for (const quest of quests) {
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) liste.push({ quest: quest.id, szene });
    }
  }
  return liste;
}

export function pruefeSzenen(quests = QUESTS): SzenenMangel[] {
  return alleSzenen(quests).flatMap(({ quest, szene }) => [
    ...pruefeSzeneText(szene, quest),
    ...pruefeSzeneBild(szene, ART_KEYS, PORTRAIT_KEYS, quest),
  ]);
}

export function pruefeArtDateien(existiert: (pfad: string) => boolean) {
  const fehlend: { schluessel: string; src: string; art: "bild" | "portrait" }[] = [];
  for (const [schluessel, src] of Object.entries(ART) as [ArtKey, string][]) {
    if (!existiert(src)) fehlend.push({ schluessel, src, art: "bild" });
  }
  for (const [schluessel, src] of Object.entries(PORTRAITS) as [PortraitKey, string][]) {
    if (!existiert(src)) fehlend.push({ schluessel, src, art: "portrait" });
  }
  return fehlend;
}

export function dateiPfad(src: string) {
  return src.replace(/^\//, "public/");
}
