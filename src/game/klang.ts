/**
 * Klangwerk — Ton für Lindendorf.
 *
 * Alles wird im Browser erzeugt: kein Audioarchiv, keine Ladezeit, keine
 * Lizenzfragen. Rauschen, Filter und wenige Oszillatoren ergeben Wind,
 * Wasser, Feuer, Hammerschlag und Stimmengemurmel. Effekte sind kurze
 * Hüllkurven auf denselben Bausteinen.
 *
 * Zwei Busse: Ambiente und Effekte, beide unter einem Gesamtregler.
 * Der Ton bleibt still, bis der Mensch etwas anfasst — so will es der Browser.
 */

import { abonniere, leseEinstellungen } from "./einstellungen";
import type { Tageszeit } from "./weltzustand";

export type KlangName =
  | "wahl"
  | "zeiger"
  | "oeffnen"
  | "schliessen"
  | "wuerfel"
  | "erfolg"
  | "misserfolg"
  | "seite"
  | "speichern"
  | "treffer"
  | "tod"
  | "ende"
  | "fehler";

export type AmbienteId =
  | "still"
  | "titel"
  | "strasse"
  | "dorf"
  | "halle"
  | "taverne"
  | "wasser"
  | "gewoelbe"
  | "schmiede"
  | "wald"
  | "lager"
  | "kampf";

type Abbau = () => void;

const ABKLINGEN = 1.4;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambienteBus: GainNode | null = null;
let effektBus: GainNode | null = null;
let hall: ConvolverNode | null = null;
let hallWeg: GainNode | null = null;
let rauschen: AudioBuffer | null = null;
let entsperrt = false;
let laufendeId: AmbienteId = "still";
let laufendeZeit: Tageszeit = "tag";
let laufendeSchicht: { gain: GainNode; abbau: Abbau } | null = null;
let letzterZeiger = 0;

function amLeben(): boolean {
  return typeof window !== "undefined" && typeof window.AudioContext !== "undefined";
}

function baueRauschen(context: AudioContext): AudioBuffer {
  const laenge = context.sampleRate * 4;
  const puffer = context.createBuffer(1, laenge, context.sampleRate);
  const daten = puffer.getChannelData(0);
  let letzter = 0;
  for (let i = 0; i < laenge; i += 1) {
    const weiss = Math.random() * 2 - 1;
    letzter = (letzter + 0.02 * weiss) / 1.02;
    daten[i] = letzter * 3.2;
  }
  return puffer;
}

function baueHall(context: AudioContext): AudioBuffer {
  const laenge = Math.floor(context.sampleRate * 1.8);
  const puffer = context.createBuffer(2, laenge, context.sampleRate);
  for (let kanal = 0; kanal < 2; kanal += 1) {
    const daten = puffer.getChannelData(kanal);
    for (let i = 0; i < laenge; i += 1) {
      const zerfall = (1 - i / laenge) ** 2.6;
      daten[i] = (Math.random() * 2 - 1) * zerfall * 0.6;
    }
  }
  return puffer;
}

function starte(): AudioContext | null {
  if (!amLeben()) return null;
  if (ctx) return ctx;
  try {
    ctx = new AudioContext();
  } catch {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  hall = ctx.createConvolver();
  hall.buffer = baueHall(ctx);
  hallWeg = ctx.createGain();
  hallWeg.gain.value = 0.22;
  hall.connect(master);
  hallWeg.connect(hall);

  ambienteBus = ctx.createGain();
  ambienteBus.gain.value = 0;
  ambienteBus.connect(master);

  effektBus = ctx.createGain();
  effektBus.gain.value = 0;
  effektBus.connect(master);
  effektBus.connect(hallWeg);

  rauschen = baueRauschen(ctx);
  wendeLautstaerkeAn();
  return ctx;
}

function rauschQuelle(context: AudioContext): AudioBufferSourceNode {
  const quelle = context.createBufferSource();
  quelle.buffer = rauschen ?? baueRauschen(context);
  quelle.loop = true;
  return quelle;
}

/** Sanfte Rampe statt harter Sprung — sonst knackt es. */
function rampe(param: AudioParam, ziel: number, sekunden = 0.12) {
  const context = ctx;
  if (!context) return;
  const jetzt = context.currentTime;
  param.cancelScheduledValues(jetzt);
  param.setValueAtTime(Math.max(0.0001, param.value), jetzt);
  param.linearRampToValueAtTime(Math.max(0.0001, ziel), jetzt + sekunden);
}

export function wendeLautstaerkeAn(): void {
  if (!ctx || !master || !ambienteBus || !effektBus) return;
  const ton = leseEinstellungen().ton;
  const gesamt = ton.an ? ton.gesamt : 0;
  rampe(master.gain, gesamt, 0.25);
  rampe(ambienteBus.gain, ton.ambiente * 0.85, 0.25);
  rampe(effektBus.gain, ton.effekte, 0.1);
}

/**
 * Browser lassen Ton erst nach einer echten Geste zu.
 * Wird beim ersten Klick, Tastendruck oder Tippen gerufen.
 */
export function entsperreKlang(): void {
  if (!leseEinstellungen().ton.an) return;
  const context = starte();
  if (!context) return;
  if (context.state === "suspended") void context.resume();
  if (!entsperrt) {
    entsperrt = true;
    wendeLautstaerkeAn();
    if (laufendeId !== "still") setzeAmbiente(laufendeId, laufendeZeit, true);
  }
}

// ---------------------------------------------------------------- Bausteine

type Schicht = (context: AudioContext, ziel: GainNode, tag: Tageszeit) => Abbau;

/** Tiefer, langsam atmender Grundton. Trägt die Stimmung. */
function drone(frequenzen: number[], pegel: number): Schicht {
  return (context, ziel) => {
    const bus = context.createGain();
    bus.gain.value = pegel;
    bus.connect(ziel);
    const stoppen: Array<() => void> = [];
    frequenzen.forEach((hz, index) => {
      const osz = context.createOscillator();
      osz.type = index % 2 === 0 ? "sine" : "triangle";
      osz.frequency.value = hz;
      osz.detune.value = (index - frequenzen.length / 2) * 6;
      const stimme = context.createGain();
      stimme.gain.value = 0.0001;
      const atem = context.createOscillator();
      atem.type = "sine";
      atem.frequency.value = 0.035 + index * 0.017;
      const atemTiefe = context.createGain();
      atemTiefe.gain.value = 0.5 / frequenzen.length;
      atem.connect(atemTiefe);
      atemTiefe.connect(stimme.gain);
      stimme.gain.setValueAtTime(0.55 / frequenzen.length, context.currentTime);
      osz.connect(stimme);
      stimme.connect(bus);
      osz.start();
      atem.start();
      stoppen.push(() => {
        try {
          osz.stop();
          atem.stop();
        } catch {
          /* schon gestoppt */
        }
      });
    });
    return () => {
      for (const halt of stoppen) halt();
      bus.disconnect();
    };
  };
}

/** Wind, Zugluft, Regen — gefiltertes Rauschen mit wanderndem Filter. */
function wind(cutoff: number, guete: number, pegel: number, tempo = 0.08): Schicht {
  return (context, ziel) => {
    const quelle = rauschQuelle(context);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = cutoff;
    filter.Q.value = guete;
    const bus = context.createGain();
    bus.gain.value = pegel;

    const boe = context.createOscillator();
    boe.type = "sine";
    boe.frequency.value = tempo;
    const boeTiefe = context.createGain();
    boeTiefe.gain.value = cutoff * 0.45;
    boe.connect(boeTiefe);
    boeTiefe.connect(filter.frequency);

    const atem = context.createOscillator();
    atem.type = "sine";
    atem.frequency.value = tempo * 0.6;
    const atemTiefe = context.createGain();
    atemTiefe.gain.value = pegel * 0.55;
    atem.connect(atemTiefe);
    atemTiefe.connect(bus.gain);

    quelle.connect(filter);
    filter.connect(bus);
    bus.connect(ziel);
    quelle.start();
    boe.start();
    atem.start();
    return () => {
      try {
        quelle.stop();
        boe.stop();
        atem.stop();
      } catch {
        /* schon gestoppt */
      }
      bus.disconnect();
    };
  };
}

/** Einzelne, zufällige Ereignisse: Tropfen, Funken, Hammerschläge, Krähen. */
function streu(
  abstand: [number, number],
  pegel: number,
  stimme: (context: AudioContext, ziel: AudioNode, zeit: number) => void,
): Schicht {
  return (context, ziel) => {
    const bus = context.createGain();
    bus.gain.value = pegel;
    bus.connect(ziel);
    let uhr: ReturnType<typeof setTimeout> | null = null;
    let lebt = true;
    const takt = () => {
      if (!lebt) return;
      stimme(context, bus, context.currentTime + 0.02);
      const [klein, gross] = abstand;
      uhr = setTimeout(takt, (klein + Math.random() * (gross - klein)) * 1000);
    };
    uhr = setTimeout(takt, Math.random() * abstand[1] * 1000);
    return () => {
      lebt = false;
      if (uhr) clearTimeout(uhr);
      bus.disconnect();
    };
  };
}

function tropfenStimme(context: AudioContext, ziel: AudioNode, zeit: number) {
  const osz = context.createOscillator();
  osz.type = "sine";
  const hoehe = 620 + Math.random() * 520;
  osz.frequency.setValueAtTime(hoehe * 1.7, zeit);
  osz.frequency.exponentialRampToValueAtTime(hoehe, zeit + 0.07);
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(0.5, zeit + 0.004);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.28);
  osz.connect(huelle);
  huelle.connect(ziel);
  osz.start(zeit);
  osz.stop(zeit + 0.32);
}

function funkenStimme(context: AudioContext, ziel: AudioNode, zeit: number) {
  const quelle = rauschQuelle(context);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800 + Math.random() * 2600;
  filter.Q.value = 6;
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(0.35 + Math.random() * 0.3, zeit + 0.005);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.05 + Math.random() * 0.06);
  quelle.connect(filter);
  filter.connect(huelle);
  huelle.connect(ziel);
  quelle.start(zeit);
  quelle.stop(zeit + 0.2);
}

function hammerStimme(context: AudioContext, ziel: AudioNode, zeit: number) {
  const osz = context.createOscillator();
  osz.type = "triangle";
  osz.frequency.setValueAtTime(240, zeit);
  osz.frequency.exponentialRampToValueAtTime(90, zeit + 0.12);
  const klang = context.createOscillator();
  klang.type = "sine";
  klang.frequency.value = 1450 + Math.random() * 180;
  const klangHuelle = context.createGain();
  klangHuelle.gain.setValueAtTime(0.0001, zeit);
  klangHuelle.gain.exponentialRampToValueAtTime(0.16, zeit + 0.006);
  klangHuelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.55);
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(0.5, zeit + 0.005);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.3);
  osz.connect(huelle);
  klang.connect(klangHuelle);
  huelle.connect(ziel);
  klangHuelle.connect(ziel);
  osz.start(zeit);
  klang.start(zeit);
  osz.stop(zeit + 0.35);
  klang.stop(zeit + 0.6);
}

function kraeheStimme(context: AudioContext, ziel: AudioNode, zeit: number) {
  const osz = context.createOscillator();
  osz.type = "sawtooth";
  const grund = 380 + Math.random() * 120;
  osz.frequency.setValueAtTime(grund, zeit);
  osz.frequency.exponentialRampToValueAtTime(grund * 0.55, zeit + 0.22);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1100;
  filter.Q.value = 3;
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(0.22, zeit + 0.03);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.3);
  osz.connect(filter);
  filter.connect(huelle);
  huelle.connect(ziel);
  osz.start(zeit);
  osz.stop(zeit + 0.34);
}

function holzStimme(context: AudioContext, ziel: AudioNode, zeit: number) {
  const quelle = rauschQuelle(context);
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500 + Math.random() * 400;
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(0.3, zeit + 0.02);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.4);
  quelle.connect(filter);
  filter.connect(huelle);
  huelle.connect(ziel);
  quelle.start(zeit);
  quelle.stop(zeit + 0.5);
}

/** Stimmengemurmel: Formantfilter über Rauschen, langsam moduliert. */
function murmeln(pegel: number): Schicht {
  return (context, ziel) => {
    const quelle = rauschQuelle(context);
    const bus = context.createGain();
    bus.gain.value = pegel;
    const stoppen: Array<() => void> = [];
    for (const [hz, q] of [
      [420, 9],
      [780, 11],
      [1350, 8],
    ] as const) {
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = hz;
      filter.Q.value = q;
      const lfo = context.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.4 + Math.random() * 1.6;
      const tiefe = context.createGain();
      tiefe.gain.value = hz * 0.12;
      lfo.connect(tiefe);
      tiefe.connect(filter.frequency);
      quelle.connect(filter);
      filter.connect(bus);
      lfo.start();
      stoppen.push(() => {
        try {
          lfo.stop();
        } catch {
          /* schon gestoppt */
        }
      });
    }
    bus.connect(ziel);
    quelle.start();
    return () => {
      try {
        quelle.stop();
      } catch {
        /* schon gestoppt */
      }
      for (const halt of stoppen) halt();
      bus.disconnect();
    };
  };
}

// ---------------------------------------------------------------- Orte

const ORTE: Record<AmbienteId, Schicht[]> = {
  still: [],
  titel: [drone([55, 82.5, 110], 0.16), wind(240, 0.7, 0.05, 0.05)],
  strasse: [drone([49, 73.5], 0.1), wind(420, 0.8, 0.11, 0.09), streu([6, 18], 0.3, kraeheStimme)],
  dorf: [drone([55, 82.5], 0.08), wind(360, 0.9, 0.07, 0.07), streu([9, 26], 0.22, kraeheStimme)],
  halle: [drone([44, 66], 0.11), wind(180, 1.4, 0.04, 0.04), streu([7, 20], 0.18, holzStimme)],
  taverne: [
    drone([58, 87], 0.07),
    murmeln(0.065),
    streu([1.6, 5], 0.3, funkenStimme),
    streu([5, 14], 0.16, holzStimme),
  ],
  wasser: [
    drone([49, 73.5], 0.09),
    wind(700, 1.6, 0.07, 0.11),
    streu([0.7, 3.2], 0.26, tropfenStimme),
  ],
  gewoelbe: [
    drone([38, 57, 76], 0.15),
    wind(150, 2.2, 0.05, 0.03),
    streu([1.4, 5.5], 0.3, tropfenStimme),
  ],
  schmiede: [
    drone([55, 110], 0.09),
    wind(900, 0.9, 0.06, 0.12),
    streu([1.1, 3.4], 0.34, hammerStimme),
    streu([0.5, 1.8], 0.14, funkenStimme),
  ],
  wald: [
    drone([46, 69], 0.08),
    wind(1600, 0.6, 0.13, 0.06),
    wind(300, 1.1, 0.06, 0.1),
    streu([4, 13], 0.2, kraeheStimme),
  ],
  lager: [drone([41, 61.5], 0.12), wind(380, 1, 0.08, 0.08), streu([0.9, 3], 0.3, funkenStimme)],
  kampf: [drone([36, 54, 72], 0.2), wind(520, 0.8, 0.12, 0.22)],
};

/** Nacht senkt den Grundton, Tag hebt die Luft. */
function zeitFaktor(zeit: Tageszeit): { pegel: number; farbe: number } {
  if (zeit === "nacht") return { pegel: 0.85, farbe: 0.72 };
  if (zeit === "daemmerung") return { pegel: 0.95, farbe: 0.88 };
  return { pegel: 1, farbe: 1 };
}

export function setzeAmbiente(id: AmbienteId, zeit: Tageszeit = "tag", erzwingen = false): void {
  const gleich = id === laufendeId && zeit === laufendeZeit;
  laufendeId = id;
  laufendeZeit = zeit;
  if (!leseEinstellungen().ton.an || !entsperrt) return;
  if (gleich && !erzwingen && laufendeSchicht) return;

  const context = starte();
  if (!context || !ambienteBus) return;

  const alt = laufendeSchicht;
  if (alt) {
    rampe(alt.gain.gain, 0.0001, ABKLINGEN);
    const abbau = alt.abbau;
    setTimeout(
      () => {
        abbau();
        alt.gain.disconnect();
      },
      ABKLINGEN * 1000 + 120,
    );
  }
  laufendeSchicht = null;
  if (id === "still") return;

  const { pegel, farbe } = zeitFaktor(zeit);
  const gain = context.createGain();
  gain.gain.value = 0.0001;
  const faerbung = context.createBiquadFilter();
  faerbung.type = "lowpass";
  faerbung.frequency.value = 2200 * farbe + 600;
  gain.connect(faerbung);
  faerbung.connect(ambienteBus);

  const abbauListe = ORTE[id].map((schicht) => schicht(context, gain, zeit));
  rampe(gain.gain, pegel, ABKLINGEN);
  laufendeSchicht = {
    gain,
    abbau: () => {
      for (const abbau of abbauListe) abbau();
    },
  };
}

export function haltAmbiente(): void {
  const alt = laufendeSchicht;
  laufendeSchicht = null;
  if (!alt) return;
  rampe(alt.gain.gain, 0.0001, 0.4);
  setTimeout(() => {
    alt.abbau();
    alt.gain.disconnect();
  }, 500);
}

// ---------------------------------------------------------------- Effekte

function klick(
  context: AudioContext,
  ziel: AudioNode,
  zeit: number,
  hoehe: number,
  pegel: number,
  laenge = 0.09,
) {
  const quelle = rauschQuelle(context);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = hoehe;
  filter.Q.value = 4;
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(pegel, zeit + 0.004);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + laenge);
  quelle.connect(filter);
  filter.connect(huelle);
  huelle.connect(ziel);
  quelle.start(zeit);
  quelle.stop(zeit + laenge + 0.05);
}

function ton(
  context: AudioContext,
  ziel: AudioNode,
  zeit: number,
  von: number,
  bis: number,
  pegel: number,
  laenge: number,
  form: OscillatorType = "triangle",
) {
  const osz = context.createOscillator();
  osz.type = form;
  osz.frequency.setValueAtTime(von, zeit);
  if (bis !== von) osz.frequency.exponentialRampToValueAtTime(Math.max(20, bis), zeit + laenge);
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(pegel, zeit + Math.min(0.03, laenge * 0.2));
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + laenge);
  osz.connect(huelle);
  huelle.connect(ziel);
  osz.start(zeit);
  osz.stop(zeit + laenge + 0.05);
}

function rausch(
  context: AudioContext,
  ziel: AudioNode,
  zeit: number,
  von: number,
  bis: number,
  pegel: number,
  laenge: number,
) {
  const quelle = rauschQuelle(context);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(von, zeit);
  filter.frequency.exponentialRampToValueAtTime(Math.max(60, bis), zeit + laenge);
  const huelle = context.createGain();
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(pegel, zeit + laenge * 0.25);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + laenge);
  quelle.connect(filter);
  filter.connect(huelle);
  huelle.connect(ziel);
  quelle.start(zeit);
  quelle.stop(zeit + laenge + 0.05);
}

const EFFEKTE: Record<KlangName, (context: AudioContext, ziel: AudioNode, t: number) => void> = {
  zeiger: (c, z, t) => klick(c, z, t, 3200, 0.05, 0.03),
  wahl: (c, z, t) => {
    klick(c, z, t, 1500, 0.3, 0.07);
    ton(c, z, t, 180, 120, 0.16, 0.1);
  },
  oeffnen: (c, z, t) => {
    rausch(c, z, t, 300, 1700, 0.16, 0.24);
    ton(c, z, t + 0.02, 220, 330, 0.12, 0.26, "sine");
  },
  schliessen: (c, z, t) => {
    rausch(c, z, t, 1500, 260, 0.15, 0.2);
    ton(c, z, t + 0.02, 300, 180, 0.11, 0.22, "sine");
  },
  seite: (c, z, t) => {
    rausch(c, z, t, 900, 2600, 0.12, 0.13);
    rausch(c, z, t + 0.1, 2400, 700, 0.1, 0.17);
  },
  wuerfel: (c, z, t) => {
    const schlaege = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < schlaege; i += 1) {
      const versatz = (i / schlaege) ** 1.6 * 0.5 + Math.random() * 0.03;
      klick(c, z, t + versatz, 900 + Math.random() * 1400, 0.3 * (1 - i / (schlaege + 2)), 0.05);
    }
  },
  erfolg: (c, z, t) => {
    ton(c, z, t, 392, 392, 0.16, 0.34, "sine");
    ton(c, z, t + 0.1, 587.33, 587.33, 0.14, 0.5, "sine");
  },
  misserfolg: (c, z, t) => {
    ton(c, z, t, 220, 220, 0.16, 0.4, "sine");
    ton(c, z, t + 0.07, 207.65, 196, 0.15, 0.6, "triangle");
  },
  speichern: (c, z, t) => {
    ton(c, z, t, 784, 784, 0.1, 0.22, "sine");
    ton(c, z, t + 0.09, 1046.5, 1046.5, 0.085, 0.36, "sine");
  },
  treffer: (c, z, t) => {
    ton(c, z, t, 140, 55, 0.34, 0.24);
    rausch(c, z, t, 1800, 400, 0.22, 0.14);
  },
  tod: (c, z, t) => {
    ton(c, z, t, 110, 41, 0.3, 1.6, "sine");
    ton(c, z, t + 0.05, 73.4, 36.7, 0.22, 2.1, "triangle");
    rausch(c, z, t, 600, 90, 0.14, 1.1);
  },
  ende: (c, z, t) => {
    for (const [i, hz] of [110, 164.81, 220, 329.63].entries()) {
      ton(c, z, t + i * 0.18, hz, hz, 0.11, 2.4 - i * 0.2, "sine");
    }
  },
  fehler: (c, z, t) => {
    ton(c, z, t, 160, 150, 0.2, 0.18, "square");
    ton(c, z, t + 0.14, 140, 120, 0.18, 0.22, "square");
  },
};

export function spieleKlang(name: KlangName): void {
  if (!leseEinstellungen().ton.an || !entsperrt) return;
  if (name === "zeiger") {
    const jetzt = Date.now();
    if (jetzt - letzterZeiger < 55) return;
    letzterZeiger = jetzt;
  }
  const context = starte();
  if (!context || !effektBus) return;
  if (context.state === "suspended") void context.resume();
  try {
    EFFEKTE[name](context, effektBus, context.currentTime + 0.01);
  } catch {
    /* Ton ist nie wichtiger als das Spiel. */
  }
}

// ---------------------------------------------------------------- Anbindung

/** Ordnet einem Szenenbild den passenden Ort zu. */
export function ambienteFuerBild(art: string): AmbienteId {
  switch (art) {
    case "title":
      return "titel";
    case "road":
    case "stranger":
    case "return":
      return "strasse";
    case "village":
      return "dorf";
    case "townhall":
      return "halle";
    case "chapel":
      return "gewoelbe";
    case "tavern":
      return "taverne";
    case "well":
    case "mill":
      return "wasser";
    case "smithy":
    case "apothecary":
      return "schmiede";
    case "forest":
    case "ditch":
      return "wald";
    case "camp":
    case "gate":
    case "sneak":
    case "evidence":
      return "lager";
    case "combat":
    case "death":
      return "kampf";
    default:
      return "dorf";
  }
}

let angebunden = false;

/**
 * Hängt den Ton an Fenster und Einstellungen: erste Geste entsperrt,
 * verdeckter Tab schweigt, Reglerwechsel wirkt sofort.
 */
export function bindeKlang(): () => void {
  if (typeof window === "undefined" || angebunden) return () => undefined;
  angebunden = true;

  const geste = () => entsperreKlang();
  window.addEventListener("pointerdown", geste, { passive: true });
  window.addEventListener("keydown", geste, { passive: true });
  window.addEventListener("touchstart", geste, { passive: true });

  const sicht = () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (leseEinstellungen().ton.an) void ctx.resume();
  };
  document.addEventListener("visibilitychange", sicht);

  const abEinstellung = abonniere(() => {
    const an = leseEinstellungen().ton.an;
    if (an) {
      entsperreKlang();
      wendeLautstaerkeAn();
      if (entsperrt) setzeAmbiente(laufendeId, laufendeZeit, true);
    } else {
      wendeLautstaerkeAn();
      haltAmbiente();
    }
  });

  return () => {
    angebunden = false;
    window.removeEventListener("pointerdown", geste);
    window.removeEventListener("keydown", geste);
    window.removeEventListener("touchstart", geste);
    document.removeEventListener("visibilitychange", sicht);
    abEinstellung();
    haltAmbiente();
  };
}

/** Kurze Probe für die Systemsteuerung — der Mensch soll hören, was er stellt. */
export function hoerprobe(): void {
  entsperreKlang();
  spieleKlang("speichern");
}
