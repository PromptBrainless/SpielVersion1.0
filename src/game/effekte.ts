import type { EffektId, Held } from "./types";

export type { EffektId };

type Mod = { all?: number; staerke?: number; geschick?: number; charisma?: number };
export type EffektPol = "gunst" | "last";

export const EFFEKT_IDS: EffektId[] = [
  "ausgeschlafen",
  "satt",
  "motiviert",
  "konzentriert",
  "neugierig",
  "trocken",
  "zuversichtlich",
  "gelassen",
  "segen",
  "hungrig",
  "wunde",
  "durstig",
  "nass",
  "fieber",
  "traurig",
  "furcht",
  "verstossung",
  "erschoepfung",
];

export const EFFEKTE: Record<
  EffektId,
  { name: string; hint: string; gruppe: EffektPol; mod: Mod }
> = {
  ausgeschlafen: { name: "Ausgeschlafen", hint: "+1 Stärke", gruppe: "gunst", mod: { staerke: 1 } },
  satt: { name: "Satt", hint: "+1 Stärke", gruppe: "gunst", mod: { staerke: 1 } },
  motiviert: { name: "Motiviert", hint: "+1 Stärke", gruppe: "gunst", mod: { staerke: 1 } },
  konzentriert: { name: "Konzentriert", hint: "+1 Geschick", gruppe: "gunst", mod: { geschick: 1 } },
  neugierig: { name: "Neugierig", hint: "+1 Geschick", gruppe: "gunst", mod: { geschick: 1 } },
  trocken: { name: "Trocken", hint: "+1 Geschick", gruppe: "gunst", mod: { geschick: 1 } },
  zuversichtlich: { name: "Zuversichtlich", hint: "+1 Charisma", gruppe: "gunst", mod: { charisma: 1 } },
  gelassen: { name: "Gelassen", hint: "+1 Charisma", gruppe: "gunst", mod: { charisma: 1 } },
  segen: { name: "Segen", hint: "+1 auf alle Proben", gruppe: "gunst", mod: { all: 1 } },
  hungrig: { name: "Hungrig", hint: "−1 Stärke", gruppe: "last", mod: { staerke: -1 } },
  wunde: { name: "Wunde", hint: "−1 Stärke", gruppe: "last", mod: { staerke: -1 } },
  durstig: { name: "Durstig", hint: "−1 Geschick", gruppe: "last", mod: { geschick: -1 } },
  nass: { name: "Nass", hint: "−1 Geschick", gruppe: "last", mod: { geschick: -1 } },
  fieber: { name: "Fieber", hint: "−1 Geschick", gruppe: "last", mod: { geschick: -1 } },
  traurig: { name: "Traurig", hint: "−1 Charisma", gruppe: "last", mod: { charisma: -1 } },
  furcht: { name: "Furcht", hint: "−1 Charisma", gruppe: "last", mod: { charisma: -1 } },
  verstossung: { name: "Verstoßung", hint: "−1 Charisma", gruppe: "last", mod: { charisma: -1 } },
  erschoepfung: { name: "Erschöpfung", hint: "−1 auf alle Proben", gruppe: "last", mod: { all: -1 } },
};

export function istEffektId(value: string): value is EffektId {
  return (EFFEKT_IDS as string[]).includes(value);
}

export function heldEffekte(held: Held | null | undefined): EffektId[] {
  return (held?.effekte ?? []).filter(istEffektId);
}

export function hatEffekt(held: Held | null | undefined, id: EffektId): boolean {
  return heldEffekte(held).includes(id);
}

export function setzeEffekt(held: Held, id: EffektId, an: boolean): Held {
  const jetzt = heldEffekte(held);
  const next = an ? [...new Set([...jetzt, id])] : jetzt.filter((item) => item !== id);
  held.effekte = next;
  return held;
}

export function attributMitEffekt(held: Held, attributName: string, basis: number): number {
  let wert = basis;
  const name = attributName.toLowerCase();
  const staerke = name.startsWith("stär") || name === "st" || name === "staerke";
  const geschick = name.startsWith("gesch") || name === "ge";
  const charisma = name.startsWith("char") || name === "ch";
  for (const id of heldEffekte(held)) {
    const mod = EFFEKTE[id].mod;
    wert += mod.all ?? 0;
    if (staerke) wert += mod.staerke ?? 0;
    if (geschick) wert += mod.geschick ?? 0;
    if (charisma) wert += mod.charisma ?? 0;
  }
  return Math.max(1, wert);
}

export function werteMitEffekt(held: Held): { staerke: number; geschick: number; charisma: number } {
  return {
    staerke: attributMitEffekt(held, "Stärke", held.staerke),
    geschick: attributMitEffekt(held, "Geschick", held.geschick),
    charisma: attributMitEffekt(held, "Charisma", held.charisma),
  };
}

export function effektNamen(held: Held | null | undefined): string[] {
  return heldEffekte(held).map((id) => EFFEKTE[id].name);
}

export function effekteDerGruppe(gruppe: EffektPol): EffektId[] {
  return EFFEKT_IDS.filter((id) => EFFEKTE[id].gruppe === gruppe);
}

export function effektDifferenz(
  vorher: readonly string[],
  nachher: readonly string[],
): { hinzu: EffektId[]; fort: EffektId[] } {
  const alt = new Set(vorher.filter(istEffektId));
  const neu = new Set(nachher.filter(istEffektId));
  return {
    hinzu: [...neu].filter((id) => !alt.has(id)),
    fort: [...alt].filter((id) => !neu.has(id)),
  };
}

export function effektZeile(id: EffektId): string {
  const item = EFFEKTE[id];
  const vor = item.gruppe === "gunst" ? "+" : "−";
  return `${vor} ${item.name} (${item.hint})`;
}
