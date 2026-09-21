import {
  HEILTRANK,
  MAX_LP,
  type Held,
  type ProbeResult,
  tot,
} from "./types";
import { attributMitEffekt, hatEffekt, setzeEffekt } from "./effekte";
import { zeitModifikator, type ProbenAktion } from "./tageszeit";

export function w10(): number {
  return 1 + Math.floor(Math.random() * 10);
}

export function situationsModifikator(held: Held, lage?: "nebel"): number {
  let extra = 0;
  if (lage === "nebel") extra -= 2;
  return extra;
}

export function probe(
  held: Held,
  attributName: string,
  attributWert: number,
  schwierigkeit: number,
  beschreibung = "",
  lage?: "nebel",
  aktion?: ProbenAktion,
): ProbeResult {
  const wert =
    attributMitEffekt(held, attributName, attributWert) +
    situationsModifikator(held, lage) +
    zeitModifikator(held, aktion, attributName);
  const wurf = w10();
  const summe = wurf + wert;
  return {
    beschreibung,
    attributName,
    attributWert: wert,
    wurf,
    summe,
    schwierigkeit,
    erfolg: summe >= schwierigkeit,
  };
}

export function schaden(held: Held, punkte: number, grund = ""): string {
  held.lp -= punkte;
  if (held.lp < 0) held.lp = 0;
  if (punkte >= 3) {
    held.verwundet = true;
    setzeEffekt(held, "wunde", true);
  }
  const line = grund
    ? `Du verlierst ${punkte} Lebenspunkte (${grund}). LP: ${held.lp}/${MAX_LP}`
    : `Du verlierst ${punkte} Lebenspunkte. LP: ${held.lp}/${MAX_LP}`;
  if (held.lp <= 0) {
    held.lebend = false;
    return `${line}\nDeine Kräfte verlassen dich.`;
  }
  return line;
}

export function heilen(held: Held, punkte: number): string {
  const alt = held.lp;
  held.lp = Math.min(MAX_LP, held.lp + punkte);
  const gewonnen = held.lp - alt;
  if (held.lp >= 8) {
    held.verwundet = false;
    setzeEffekt(held, "wunde", false);
  }
  return `Du heilst ${gewonnen} Lebenspunkte. LP: ${held.lp}/${MAX_LP}`;
}

export function hat(held: Held, item: string): boolean {
  return held.inventar.includes(item);
}

export function nimm(held: Held, item: string): string {
  if (!held.inventar.includes(item)) {
    held.inventar.push(item);
    return `→ ${item} liegt jetzt in deinem Beutel.`;
  }
  return `→ Du hast ${item} bereits.`;
}

export function goldPlus(held: Held, menge: number, grund = ""): string {
  held.gold += menge;
  const extra = grund ? ` (${grund})` : "";
  return `→ ${menge} Gold${extra}. Beutel: ${held.gold} Gold.`;
}

export function chance(n: number): boolean {
  return 1 + Math.floor(Math.random() * n) === 1;
}

export function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function canOfferHeal(held: Held): boolean {
  return !tot(held) && hat(held, HEILTRANK) && held.lp < MAX_LP;
}
