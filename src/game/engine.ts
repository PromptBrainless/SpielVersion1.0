import { attributId } from "./attribute";
import { probeErfolg, probeSumme } from "./probe-rechnung";
import {
  HEILTRANK,
  MAX_LP,
  type Held,
  type ProbeResult,
  tot,
} from "./types";
import { attributMitEffekt, setzeEffekt } from "./effekte";
import { zeitModifikator, type ProbenAktion } from "./tageszeit";

export { probeErfolg, probeSumme } from "./probe-rechnung";

export function w10(): number {
  return 1 + Math.floor(Math.random() * 10);
}

export function situationsModifikator(_held: Held, lage?: "nebel"): number {
  return lage === "nebel" ? -2 : 0;
}

export function probe(
  held: Held,
  attributName: string,
  attributWert: number,
  schwierigkeit: number,
  beschreibung = "",
  lage?: "nebel",
  aktion?: ProbenAktion,
  wurfFn: () => number = w10,
): ProbeResult {
  const attribut = attributMitEffekt(held, attributId(attributName), attributWert);
  const mod = zeitModifikator(held, aktion, attributName);
  const nebel = situationsModifikator(held, lage);
  const wurf = wurfFn();
  const summe = probeSumme(wurf, attribut, mod, nebel);
  return {
    beschreibung,
    attributName,
    attributWert: attribut,
    wurf,
    mod,
    nebel,
    summe,
    schwierigkeit,
    erfolg: probeErfolg(summe, schwierigkeit),
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
