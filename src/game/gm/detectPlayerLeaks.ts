import { SPIELER_VERBOTEN } from "./GmToolTypes";

export type LeakFund = { pfad: string; schluessel: string };

const VERBOTEN = new Set<string>(SPIELER_VERBOTEN);

function istRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scannen(value: unknown, pfad: string, fund: LeakFund[]): void {
  if (typeof value === "string") {
    for (const schluessel of VERBOTEN) {
      if (value.includes(schluessel)) fund.push({ pfad, schluessel });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => scannen(item, `${pfad}[${i}]`, fund));
    return;
  }
  if (!istRecord(value)) return;
  for (const [key, kind] of Object.entries(value)) {
    const hier = pfad ? `${pfad}.${key}` : key;
    if (VERBOTEN.has(key)) fund.push({ pfad: hier, schluessel: key });
    scannen(kind, hier, fund);
  }
}

export function detectPlayerLeaks(sicht: unknown): LeakFund[] {
  const fund: LeakFund[] = [];
  scannen(sicht, "", fund);
  return fund;
}

export function spielerDarfNichtSehen(schluessel: string): boolean {
  return VERBOTEN.has(schluessel);
}
