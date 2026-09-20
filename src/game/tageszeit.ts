import type { Held } from "./types";
import { getZeitModifikator, aktionAusAttribut, type ProbenAktion } from "./zeitModifikatoren";
import {
  deriveWelt,
  erzwingePhase,
  wendeNaechstePhaseAn,
  type Tageszeit,
} from "./weltzustand";

export type { Tageszeit, Weltzustand, Zeitphase } from "./weltzustand";
export type { ProbenAktion } from "./zeitModifikatoren";
export {
  TAGESZEITEN,
  WELT_DEFAULT,
  deriveWelt,
  erzwingePhase,
  naechstePhase,
  wendeNaechstePhaseAn,
} from "./weltzustand";
export { getZeitModifikator, aktionAusAttribut, ZEIT_MODIFIKATOREN } from "./zeitModifikatoren";

export const TAGESZEIT_TEXT: Record<Tageszeit, { name: string; satz: string }> = {
  tag: { name: "Tag", satz: "Der Tag liegt schwer über den Dächern." },
  daemmerung: { name: "Dämmerung", satz: "Die Dämmerung hält das Tal fest." },
  nacht: { name: "Nacht", satz: "Die Nacht gehört denen, die keine Fragen stellen." },
};

export function leseTageszeit(held: Held | null | undefined): Tageszeit {
  return deriveWelt(held).zeitphase;
}

export function leseSpieltag(held: Held | null | undefined): number {
  return deriveWelt(held).tag;
}

export function setzeTageszeit(held: Held, zeit: Tageszeit): void {
  erzwingePhase(held, zeit);
}

export function rueckeZeitVor(held: Held): Tageszeit {
  return wendeNaechstePhaseAn(held).zeitphase;
}

export function zeitModifikator(held: Held, aktion?: ProbenAktion, attributName?: string): number {
  const art = aktion ?? aktionAusAttribut(attributName ?? "Geschicklichkeit");
  return getZeitModifikator(art, leseTageszeit(held));
}

export function tageszeitSchleier(zeit: Tageszeit): string {
  if (zeit === "nacht") return "bg-gradient-to-t from-bg/80 via-bg/25 to-transparent";
  if (zeit === "daemmerung") return "bg-gradient-to-t from-bg/45 via-bg/10 to-transparent";
  return "";
}
