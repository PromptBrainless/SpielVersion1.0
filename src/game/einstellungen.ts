/**
 * Einstellungen — Systemsteuerung für Lindendorf.
 *
 * Ein einziger Speicher für Ton, Darstellung und Spielverhalten.
 * Liegt lokal im Browser, überlebt Neuladen, kennt keinen Server.
 * Die Oberfläche liest über `useEinstellungen()`, das DOM über
 * `wendeEinstellungenAn()` (Datenattribute und CSS-Variablen).
 */

const KEY = "lindendorf.einstellungen.v1";

export type Textgroesse = "klein" | "normal" | "gross" | "riesig";
export type Bewegung = "voll" | "wenig" | "aus";
export type Kontrast = "normal" | "hoch";
export type Schriftart = "serif" | "gut-lesbar";

export type Einstellungen = {
  ton: {
    an: boolean;
    gesamt: number;
    ambiente: number;
    effekte: number;
  };
  optik: {
    textgroesse: Textgroesse;
    zeilenabstand: number;
    schriftart: Schriftart;
    kontrast: Kontrast;
    bewegung: Bewegung;
    kenBurns: boolean;
    vignette: boolean;
    koernung: boolean;
    schleier: boolean;
    bildhoehe: number;
  };
  spiel: {
    autospeichern: boolean;
    ziffernwahl: boolean;
    tastenhinweise: boolean;
    probeErklaeren: boolean;
  };
};

export const EINSTELLUNGEN_STANDARD: Einstellungen = {
  ton: { an: false, gesamt: 0.7, ambiente: 0.5, effekte: 0.7 },
  optik: {
    textgroesse: "normal",
    zeilenabstand: 1.6,
    schriftart: "serif",
    kontrast: "normal",
    bewegung: "voll",
    kenBurns: true,
    vignette: true,
    koernung: true,
    schleier: true,
    bildhoehe: 1,
  },
  spiel: {
    autospeichern: true,
    ziffernwahl: true,
    tastenhinweise: true,
    probeErklaeren: true,
  },
};

export const TEXTGROESSE_FAKTOR: Record<Textgroesse, number> = {
  klein: 0.92,
  normal: 1,
  gross: 1.12,
  riesig: 1.28,
};

export const TEXTGROESSE_NAME: Record<Textgroesse, string> = {
  klein: "Klein",
  normal: "Normal",
  gross: "Groß",
  riesig: "Sehr groß",
};

export const BEWEGUNG_NAME: Record<Bewegung, string> = {
  voll: "Voll",
  wenig: "Ruhig",
  aus: "Aus",
};

function zahl(wert: unknown, klein: number, gross: number, ersatz: number): number {
  const n = typeof wert === "number" ? wert : Number(wert);
  if (!Number.isFinite(n)) return ersatz;
  return Math.min(gross, Math.max(klein, n));
}

function wahl<T extends string>(wert: unknown, erlaubt: readonly T[], ersatz: T): T {
  return erlaubt.includes(wert as T) ? (wert as T) : ersatz;
}

function bool(wert: unknown, ersatz: boolean): boolean {
  return typeof wert === "boolean" ? wert : ersatz;
}

/** Nimmt beliebiges JSON und macht daraus gültige Einstellungen. */
export function normalisiere(roh: unknown): Einstellungen {
  const quelle = (roh ?? {}) as Partial<Record<keyof Einstellungen, Record<string, unknown>>>;
  const ton = quelle.ton ?? {};
  const optik = quelle.optik ?? {};
  const spiel = quelle.spiel ?? {};
  const s = EINSTELLUNGEN_STANDARD;
  return {
    ton: {
      an: bool(ton.an, s.ton.an),
      gesamt: zahl(ton.gesamt, 0, 1, s.ton.gesamt),
      ambiente: zahl(ton.ambiente, 0, 1, s.ton.ambiente),
      effekte: zahl(ton.effekte, 0, 1, s.ton.effekte),
    },
    optik: {
      textgroesse: wahl(
        optik.textgroesse,
        ["klein", "normal", "gross", "riesig"] as const,
        s.optik.textgroesse,
      ),
      zeilenabstand: zahl(optik.zeilenabstand, 1.3, 2.1, s.optik.zeilenabstand),
      schriftart: wahl(optik.schriftart, ["serif", "gut-lesbar"] as const, s.optik.schriftart),
      kontrast: wahl(optik.kontrast, ["normal", "hoch"] as const, s.optik.kontrast),
      bewegung: wahl(optik.bewegung, ["voll", "wenig", "aus"] as const, s.optik.bewegung),
      kenBurns: bool(optik.kenBurns, s.optik.kenBurns),
      vignette: bool(optik.vignette, s.optik.vignette),
      koernung: bool(optik.koernung, s.optik.koernung),
      schleier: bool(optik.schleier, s.optik.schleier),
      bildhoehe: zahl(optik.bildhoehe, 0.6, 1.3, s.optik.bildhoehe),
    },
    spiel: {
      autospeichern: bool(spiel.autospeichern, s.spiel.autospeichern),
      ziffernwahl: bool(spiel.ziffernwahl, s.spiel.ziffernwahl),
      tastenhinweise: bool(spiel.tastenhinweise, s.spiel.tastenhinweise),
      probeErklaeren: bool(spiel.probeErklaeren, s.spiel.probeErklaeren),
    },
  };
}

function lies(): Einstellungen {
  if (typeof window === "undefined") return EINSTELLUNGEN_STANDARD;
  try {
    const roh = window.localStorage.getItem(KEY);
    if (!roh) return systemVorgabe();
    return normalisiere(JSON.parse(roh));
  } catch {
    return EINSTELLUNGEN_STANDARD;
  }
}

/** Erster Start: Systemwünsche des Geräts achten. */
function systemVorgabe(): Einstellungen {
  const basis = EINSTELLUNGEN_STANDARD;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return basis;
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hart = window.matchMedia("(prefers-contrast: more)").matches;
  if (!ruhig && !hart) return basis;
  return {
    ...basis,
    optik: {
      ...basis.optik,
      bewegung: ruhig ? "aus" : basis.optik.bewegung,
      kenBurns: ruhig ? false : basis.optik.kenBurns,
      kontrast: hart ? "hoch" : basis.optik.kontrast,
      koernung: hart ? false : basis.optik.koernung,
    },
  };
}

let zustand: Einstellungen = lies();
const horcher = new Set<() => void>();

function melde() {
  for (const ruf of horcher) ruf();
}

function schreibe(naechste: Einstellungen) {
  zustand = naechste;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(naechste));
    } catch {
      /* Privates Fenster oder voller Speicher — Einstellung gilt für diese Sitzung. */
    }
  }
  wendeEinstellungenAn(naechste);
  melde();
}

export function leseEinstellungen(): Einstellungen {
  return zustand;
}

export function abonniere(ruf: () => void): () => void {
  horcher.add(ruf);
  return () => {
    horcher.delete(ruf);
  };
}

/** Teilweises Setzen: `setzeEinstellung("ton", { an: true })`. */
export function setzeEinstellung<K extends keyof Einstellungen>(
  bereich: K,
  teil: Partial<Einstellungen[K]>,
): Einstellungen {
  const naechste = normalisiere({ ...zustand, [bereich]: { ...zustand[bereich], ...teil } });
  schreibe(naechste);
  return naechste;
}

export function setzeEinstellungen(roh: unknown): Einstellungen {
  const naechste = normalisiere(roh);
  schreibe(naechste);
  return naechste;
}

export function setzeZurueck(): Einstellungen {
  const naechste = normalisiere(EINSTELLUNGEN_STANDARD);
  schreibe(naechste);
  return naechste;
}

/** Gilt eine Bewegung als erlaubt? Prüft Einstellung und Gerätewunsch. */
export function bewegungErlaubt(stufe: "klein" | "gross" = "klein"): boolean {
  const b = zustand.optik.bewegung;
  if (b === "aus") return false;
  if (b === "wenig") return stufe === "klein";
  return true;
}

/**
 * Schreibt die Einstellungen in `<html>`: Datenattribute für CSS-Schalter,
 * Variablen für Maße. Ein Ort, keine verstreuten Klassen.
 */
export function wendeEinstellungenAn(e: Einstellungen = zustand): void {
  if (typeof document === "undefined") return;
  const wurzel = document.documentElement;
  wurzel.dataset.textgroesse = e.optik.textgroesse;
  wurzel.dataset.kontrast = e.optik.kontrast;
  wurzel.dataset.bewegung = e.optik.bewegung;
  wurzel.dataset.schriftart = e.optik.schriftart;
  wurzel.dataset.vignette = e.optik.vignette ? "an" : "aus";
  wurzel.dataset.koernung = e.optik.koernung ? "an" : "aus";
  wurzel.dataset.schleier = e.optik.schleier ? "an" : "aus";
  wurzel.dataset.kenburns = e.optik.kenBurns && e.optik.bewegung !== "aus" ? "an" : "aus";
  wurzel.style.setProperty("--textskala", String(TEXTGROESSE_FAKTOR[e.optik.textgroesse]));
  wurzel.style.setProperty("--zeilenabstand", String(e.optik.zeilenabstand));
  wurzel.style.setProperty("--bildhoehe", String(e.optik.bildhoehe));
}

export const EINSTELLUNGEN_KEY = KEY;
