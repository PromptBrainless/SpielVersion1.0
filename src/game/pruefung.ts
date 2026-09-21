import { ART, PORTRAITS } from "./art";
import { QUESTS, kanonZeilen, zeilenAusKanon } from "./json/baum";
import type { SzeneJson } from "./json/schema";
import { KURZ_GRENZE, pruefeSzeneBild, pruefeSzeneText, zeilenMass, type SzenenMangel } from "./pruefung-text";
import type { ArtKey, PortraitKey } from "./types";

export { istStichpunkt, pruefeSzeneBild, pruefeSzeneText, zeilenMass, KURZ_GRENZE } from "./pruefung-text";
export type { MangelArt, SzenenMangel } from "./pruefung-text";

const ART_KEYS = new Set(Object.keys(ART));
const PORTRAIT_KEYS = new Set(Object.keys(PORTRAITS));

/** Karten, die nur Wahl sind, kein erzählender Auftritt. */
export const PROSA_AUSNAHME = new Set(["wissen-abreise"]);

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

export type Verschiebung = {
  id: string;
  quest: string;
  titel: string;
  spiel: number;
  kanon: number;
};

/** Spielkarte kürzer als hinterlegte Vollform — Text liegt woanders. */
export function pruefeVerschiebung(quests = QUESTS): Verschiebung[] {
  const fund: Verschiebung[] = [];
  for (const { quest, szene } of alleSzenen(quests)) {
    if (PROSA_AUSNAHME.has(szene.id)) continue;
    const kanon = kanonZeilen(szene.id, szene.title) ?? szene.lines ?? [];
    const spiel = zeilenAusKanon(szene.id, szene.title, szene.lines ?? []);
    const k = zeilenMass(kanon).chars;
    const s = zeilenMass(spiel).chars;
    if (k >= KURZ_GRENZE && s + 40 < k) {
      fund.push({ id: szene.id, quest, titel: szene.title, spiel: s, kanon: k });
    }
  }
  return fund;
}

export function pruefeSpielkarte(id: string | undefined, titel: string | undefined, presentLines: string[]) {
  const kanon = kanonZeilen(id, titel);
  const spiel = zeilenAusKanon(id, titel, presentLines);
  const k = zeilenMass(kanon ?? []).chars;
  const s = zeilenMass(spiel).chars;
  const p = zeilenMass(presentLines).chars;
  return {
    id,
    titel,
    present: p,
    spiel: s,
    kanon: k,
    verschoben: Boolean(k >= KURZ_GRENZE && s + 40 < k),
    kurz: !PROSA_AUSNAHME.has(id ?? "") && s < KURZ_GRENZE && p < KURZ_GRENZE && k < KURZ_GRENZE,
  };
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
