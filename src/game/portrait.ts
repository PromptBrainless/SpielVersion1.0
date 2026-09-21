import type { PortraitKey } from "./types";

/**
 * Porträt gilt nur für diese Seite.
 * Gesetztes Gesicht gewinnt. Sonst Kanon der Seite.
 * null ohne Kanon räumt ein hängengebliebenes Gesicht.
 */
export function loesePortrait(input: {
  gesetzt?: PortraitKey | null;
  kanon?: PortraitKey | null;
  artWechsel: boolean;
  seitenWechsel: boolean;
  zuletzt?: PortraitKey;
}): PortraitKey | undefined {
  if (input.gesetzt) return input.gesetzt;
  if (input.kanon) return input.kanon;
  if (input.gesetzt === null || input.kanon === null) return undefined;
  if (input.artWechsel || input.seitenWechsel) return undefined;
  return input.zuletzt;
}
