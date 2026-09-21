import type { SceneView } from "../types";
import { auflageLeer, type WeltAuflage } from "../welt";
import type { KartenState } from "./GmToolTypes";

export function mapKartenState(szene: SceneView | null, auflage: WeltAuflage): KartenState | null {
  if (!szene) return null;
  const stand = auflageLeer(auflage) ? "kanon" : "auflage";
  return {
    id: szene.id ?? "",
    title: auflage.title ?? szene.title,
    art: auflage.art ?? szene.art,
    portrait: auflage.portrait === undefined ? (szene.portrait ?? null) : auflage.portrait,
    lines: auflage.lines ?? szene.lines,
    choices: auflage.choices ?? szene.choices,
    artSrc: auflage.artSrc ?? szene.artSrc,
    portraitSrc: auflage.portraitSrc ?? szene.portraitSrc,
    stand,
  };
}
