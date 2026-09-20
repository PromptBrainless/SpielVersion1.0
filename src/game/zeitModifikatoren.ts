import type { Zeitphase } from "./weltzustand";

export type ProbenAktion = "schleichen" | "verstecken" | "reden" | "wahrnehmung" | "klettern" | "kaempfen";

export const ZEIT_MODIFIKATOREN: Record<Zeitphase, Record<ProbenAktion, number>> = {
  tag: {
    schleichen: -1,
    verstecken: -1,
    reden: 1,
    wahrnehmung: 1,
    klettern: 0,
    kaempfen: 0,
  },
  daemmerung: {
    schleichen: 1,
    verstecken: 1,
    reden: 0,
    wahrnehmung: 0,
    klettern: -1,
    kaempfen: -1,
  },
  nacht: {
    schleichen: 2,
    verstecken: 2,
    reden: -2,
    wahrnehmung: -2,
    klettern: -2,
    kaempfen: -2,
  },
};

export function getZeitModifikator(aktion: ProbenAktion, zeitphase: Zeitphase): number {
  return ZEIT_MODIFIKATOREN[zeitphase][aktion];
}

export function aktionAusAttribut(attributName: string): ProbenAktion {
  if (attributName === "Charisma") return "reden";
  if (attributName === "Stärke") return "kaempfen";
  return "schleichen";
}
