import type { EffektId, Held } from "./types";

export type { EffektId };

type Mod = { all?: number; staerke?: number; geschick?: number; charisma?: number; uebrige?: number };
export type EffektPol = "gunst" | "last";

export const ORT_EFFEKT_IDS: EffektId[] = [
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

const LAGE_EFFEKT_IDS: EffektId[] = [
  "schwer-gezeichnet",
  "empathisch",
  "abgebrueht",
  "belastet",
  "pflichtbewusst",
  "nachsichtig",
  "erbarmungslos",
  "loyal",
  "kompromittiert",
  "paranoia",
  "altruistisch",
  "zielstrebig",
  "ueberlastet",
  "hoffnungsvoll",
  "kaltherzig",
  "destruktiv",
  "unnachgiebig",
  "vertrauensvoll",
  "traumatisiert",
  "kalkulierend",
  "guetig",
  "frustriert",
  "ueberfordert",
  "abgeschottet",
  "selektiv",
  "maertyrer",
  "schuldbeladen",
  "pragmatisch",
];

export const EFFEKT_IDS: EffektId[] = [...ORT_EFFEKT_IDS, ...LAGE_EFFEKT_IDS];

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
  "schwer-gezeichnet": { name: "Schwer gezeichnet", hint: "+2 Stärke, −1 auf übrige Proben", gruppe: "gunst", mod: { staerke: 2, uebrige: -1 } },
  empathisch: { name: "Empathisch", hint: "+1 Charisma, −1 Stärke", gruppe: "gunst", mod: { charisma: 1, staerke: -1 } },
  abgebrueht: { name: "Abgebrüht", hint: "+1 Stärke, −1 Charisma", gruppe: "last", mod: { staerke: 1, charisma: -1 } },
  belastet: { name: "Belastet", hint: "−2 auf alle Proben", gruppe: "last", mod: { all: -2 } },
  pflichtbewusst: { name: "Pflichtbewusst", hint: "+1 Geschick", gruppe: "gunst", mod: { geschick: 1 } },
  nachsichtig: { name: "Nachsichtig", hint: "+1 Charisma", gruppe: "gunst", mod: { charisma: 1 } },
  erbarmungslos: { name: "Erbarmungslos", hint: "+1 Stärke, −1 Charisma", gruppe: "last", mod: { staerke: 1, charisma: -1 } },
  loyal: { name: "Loyal", hint: "+1 Stärke", gruppe: "gunst", mod: { staerke: 1 } },
  kompromittiert: { name: "Kompromittiert", hint: "−2 Charisma", gruppe: "last", mod: { charisma: -2 } },
  paranoia: { name: "Paranoiabefallene Erschöpfung", hint: "−1 auf alle Proben, +2 Geschick", gruppe: "last", mod: { all: -1, geschick: 2 } },
  altruistisch: { name: "Altruistisch", hint: "+2 Charisma, −1 Stärke", gruppe: "gunst", mod: { charisma: 2, staerke: -1 } },
  zielstrebig: { name: "Zielstrebig", hint: "+1 Geschick", gruppe: "gunst", mod: { geschick: 1 } },
  ueberlastet: { name: "Überlastet", hint: "−2 auf alle Proben", gruppe: "last", mod: { all: -2 } },
  hoffnungsvoll: { name: "Hoffnungsvoll", hint: "+1 Geschick, +1 Charisma", gruppe: "gunst", mod: { geschick: 1, charisma: 1 } },
  kaltherzig: { name: "Kaltherzig", hint: "+1 Charisma", gruppe: "last", mod: { charisma: 1 } },
  destruktiv: { name: "Destruktiv", hint: "+2 Stärke, −2 Charisma", gruppe: "last", mod: { staerke: 2, charisma: -2 } },
  unnachgiebig: { name: "Unnachgiebig", hint: "+1 Geschick, −1 Charisma", gruppe: "last", mod: { geschick: 1, charisma: -1 } },
  vertrauensvoll: { name: "Vertrauensvoll", hint: "+2 Charisma", gruppe: "gunst", mod: { charisma: 2 } },
  traumatisiert: { name: "Traumatisiert", hint: "−2 Stärke", gruppe: "last", mod: { staerke: -2 } },
  kalkulierend: { name: "Kalkulierend", hint: "+1 Stärke", gruppe: "gunst", mod: { staerke: 1 } },
  guetig: { name: "Gütig", hint: "+2 Charisma, −1 Stärke", gruppe: "gunst", mod: { charisma: 2, staerke: -1 } },
  frustriert: { name: "Frustriert", hint: "−1 auf alle Proben", gruppe: "last", mod: { all: -1 } },
  ueberfordert: { name: "Überfordert", hint: "−2 auf alle Proben, +2 Charisma", gruppe: "last", mod: { all: -2, charisma: 2 } },
  abgeschottet: { name: "Abgeschottet", hint: "+2 Geschick", gruppe: "gunst", mod: { geschick: 2 } },
  selektiv: { name: "Selektiv", hint: "+1 Charisma, +1 Geschick", gruppe: "gunst", mod: { charisma: 1, geschick: 1 } },
  maertyrer: { name: "Märtyrer", hint: "+3 Stärke", gruppe: "gunst", mod: { staerke: 3 } },
  schuldbeladen: { name: "Schuldbeladen", hint: "−2 Charisma", gruppe: "last", mod: { charisma: -2 } },
  pragmatisch: { name: "Pragmatisch", hint: "+1 auf alle Attribute", gruppe: "gunst", mod: { all: 1 } },
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
    if (mod.uebrige) {
      if (staerke && mod.staerke == null) wert += mod.uebrige;
      if (geschick && mod.geschick == null) wert += mod.uebrige;
      if (charisma && mod.charisma == null) wert += mod.uebrige;
    }
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
  return ORT_EFFEKT_IDS.filter((id) => EFFEKTE[id].gruppe === gruppe);
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
