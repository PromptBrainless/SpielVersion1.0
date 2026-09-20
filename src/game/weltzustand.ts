import type { Held } from "./types";

export const TAGESZEITEN = ["tag", "daemmerung", "nacht"] as const;
export type Zeitphase = (typeof TAGESZEITEN)[number];
export type Tageszeit = Zeitphase;

export type Weltzustand = {
  zeitphase: Zeitphase;
  tag: number;
};

export const WELT_DEFAULT: Weltzustand = {
  zeitphase: "daemmerung",
  tag: 1,
};

export function deriveWelt(held: Held | null | undefined): Weltzustand {
  const roh = held?.tageszeit as string | undefined;
  const zeitphase: Zeitphase =
    roh === "abend"
      ? "daemmerung"
      : roh && (TAGESZEITEN as readonly string[]).includes(roh)
        ? (roh as Zeitphase)
        : WELT_DEFAULT.zeitphase;
  const tag = typeof held?.spieltag === "number" && held.spieltag > 0 ? held.spieltag : WELT_DEFAULT.tag;
  return { zeitphase, tag };
}

export function naechstePhase(welt: Weltzustand): Weltzustand {
  const index = TAGESZEITEN.indexOf(welt.zeitphase);
  const zeitphase = TAGESZEITEN[(index + 1) % TAGESZEITEN.length]!;
  const tag = zeitphase === "tag" ? welt.tag + 1 : welt.tag;
  return { zeitphase, tag };
}

export function schreibeWelt(held: Held, welt: Weltzustand): Weltzustand {
  held.tageszeit = welt.zeitphase;
  held.spieltag = welt.tag;
  return welt;
}

export function wendeNaechstePhaseAn(held: Held): Weltzustand {
  return schreibeWelt(held, naechstePhase(deriveWelt(held)));
}

export function erzwingePhase(held: Held, zeitphase: Zeitphase): Weltzustand {
  return schreibeWelt(held, { ...deriveWelt(held), zeitphase });
}
