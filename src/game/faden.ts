import type { Held, UngerufenerNameWeg } from "./types";

export const FADEN_FLAGS = [
  "fadenRinne",
  "fadenMehlsackSpan",
  "fadenBettlerSohn",
  "fadenMaraWarnung",
  "fadenHolm",
  "schnurLetzterKnoten",
  "glockeNamenGelesen",
  "koehlerBefragt",
] as const;

export type FadenFlag = (typeof FADEN_FLAGS)[number];

export function fadenAnzahl(held: Held): number {
  return FADEN_FLAGS.filter((flag) => Boolean(held[flag])).length;
}

export function schliesseFaden(held: Held, weg: Exclude<UngerufenerNameWeg, null>): void {
  held.ungerufenerNameGeloest = weg;
  held.fadenGeschlossen = true;
}
