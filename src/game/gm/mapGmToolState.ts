import type { Held, SceneView } from "../types";
import type { WeltAuflage } from "../welt";
import type { GmCommandVorschau, GmToolState } from "./GmToolTypes";
import { mapKartenState } from "./mapKartenState";

export function mapGmToolState(
  held: Held | null,
  szene: SceneView | null,
  auflage: WeltAuflage,
  vorschau: GmCommandVorschau | null = null,
): GmToolState {
  const karte = mapKartenState(szene, auflage);
  return {
    stand: karte?.stand ?? "kanon",
    held,
    karte,
    vorschau,
  };
}
