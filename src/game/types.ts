import type { Entscheidung } from "./heldSchema";

export const LEICHT = 8;
export const MITTEL = 12;
export const SCHWER = 15;
export const START_LP = 10;
export const MAX_LP = 10;

export const HEILTRANK = "Heiltrank";
export const SCHLUESSEL = "Schlüssel";

export type { Entscheidung };
export type Loesungsweg =
  | "kampf"
  | "schleich"
  | "ueberreden"
  | "seitentor"
  | "schleich_ablenkung"
  | "wissen_anfuehrer"
  | "banditen_geholfen"
  | null;
export type MuehleWeg = "kampf" | "schleich" | "verhandelt" | "verraten" | null;
export type BrunnenWeg = "zerstoert" | "geoeffnet" | "verhandelt" | "bestochen" | null;
export type GasseWeg = "veroeffentlicht" | "weitergegeben" | "erpresst" | "vernichtet" | null;
export type Todesort = "steg" | "rennik" | "zisterne" | null;
export type EffektId =
  | "ausgeschlafen"
  | "satt"
  | "motiviert"
  | "konzentriert"
  | "neugierig"
  | "trocken"
  | "zuversichtlich"
  | "gelassen"
  | "segen"
  | "hungrig"
  | "wunde"
  | "durstig"
  | "nass"
  | "fieber"
  | "traurig"
  | "furcht"
  | "verstossung"
  | "erschoepfung";

export type ArtKey =
  | "title"
  | "road"
  | "stranger"
  | "village"
  | "townhall"
  | "tavern"
  | "well"
  | "mill"
  | "apothecary"
  | "smithy"
  | "forest"
  | "ditch"
  | "chapel"
  | "camp"
  | "evidence"
  | "sneak"
  | "combat"
  | "gate"
  | "death"
  | "return";

export type PortraitKey =
  | "holm"
  | "mara"
  | "kess"
  | "miller"
  | "kern"
  | "sanna"
  | "smith"
  | "beggar"
  | "grovin"
  | "dennek"
  | "lene"
  | "vahl"
  | "grete"
  | "rennik"
  | "jorren";
export type Tageszeit = "daemmerung" | "tag" | "nacht";

export type Held = {
  name: string;
  staerke: number;
  geschick: number;
  charisma: number;
  lp: number;
  inventar: string[];
  gold: number;
  banditenGewarnt: boolean;
  buergermeisterVertraut: boolean;
  verwundet: boolean;
  holmBesucht: boolean;
  auftragErhalten: boolean;
  lagerGeloest: boolean;
  loesungsweg: Loesungsweg;
  lebend: boolean;
  beuteGerettet: boolean;
  bettlerGeholfen: boolean;
  bettlerAbgewiesen: boolean;
  maraGeholfen: boolean;
  maraAbgewiesen: boolean;
  schmiedGeholfen: boolean;
  schmiedAbgewiesen: boolean;
  mehlsackGefunden: boolean;
  mehlsackGemeldet: boolean;
  letzterGastGefunden: boolean;
  letzterGastAbgewiesen: boolean;
  kernGeholfen: boolean;
  kernAbgewiesen: boolean;
  holmSiegelGefunden: boolean;
  holmSiegelVerschwiegen: boolean;
  schnurGeholfen: boolean;
  schnurAbgewiesen: boolean;
  sannaGeholfen: boolean;
  sannaAbgewiesen: boolean;
  salzGerettet: boolean;
  salzLiegenGelassen: boolean;
  glockeGestoppt: boolean;
  glockeGescheitert: boolean;
  artefaktErhalten: boolean;
  artefaktVerloren: boolean;
  artefaktWeg: Loesungsweg;
  muehleBesucht: boolean;
  spurenGefunden: boolean;
  muellerVertraut: boolean;
  bertokBedraengt: boolean;
  leneBedraengt: boolean;
  sennaBesuche: number;
  fluechtlingeEntdeckt: boolean;
  renniksBeweis: boolean;
  rennikGewarnt: boolean;
  loesungswegMuehle: MuehleWeg;
  truebungBestaetigt: boolean;
  spurAmBrunnen: boolean;
  dennekEntlarvt: boolean;
  grovinGenannt: boolean;
  grovinsGrund: boolean;
  grovinGeflohen: boolean;
  grovinVersprechen: boolean;
  loesungswegBrunnen: BrunnenWeg;
  gasseBesucht: boolean;
  fennGedraengt: boolean;
  gasseGeschichteGehoert: boolean;
  gasseSpielzeugGefunden: boolean;
  gasseOrtGesehen: boolean;
  greteGespraech: boolean;
  greteBedraengt: boolean;
  ilsesAufzeichnungenGefunden: boolean;
  vahlGrossvater: boolean;
  kuesterGewarnt: boolean;
  vahlKonfrontiert: boolean;
  loesungswegGasse: GasseWeg;
  todesort: Todesort;
  effekte: EffektId[];
  mal: string;
  entscheidungen: Entscheidung[];
  karten: string[];
  tageszeit: Tageszeit;
  spieltag: number;
};

export type ProbeResult = {
  beschreibung: string;
  attributName: string;
  attributWert: number;
  wurf: number;
  mod: number;
  nebel: number;
  summe: number;
  schwierigkeit: number;
  erfolg: boolean;
};

export type SceneView = {
  id?: string;
  idStabil?: boolean;
  title: string;
  art: ArtKey;
  portrait?: PortraitKey;
  artSrc?: string;
  portraitSrc?: string;
  lines: string[];
  held?: Held;
  probe?: ProbeResult;
  log?: string[];
  ending?: string;
  choices: string[];
  textKey?: string;
  original?: {
    title: string;
    lines: string[];
    choices: string[];
  };
  seiteHinzu?: EffektId[];
  seiteNimmt?: EffektId[];
  seiteFort?: EffektId[];
};

export function createHeld(name: string, staerke: number, geschick: number, charisma: number): Held {
  return {
    name: name.trim() || "Namenlos",
    staerke,
    geschick,
    charisma,
    lp: START_LP,
    inventar: [],
    gold: 0,
    banditenGewarnt: false,
    buergermeisterVertraut: false,
    verwundet: false,
    holmBesucht: false,
    auftragErhalten: false,
    lagerGeloest: false,
    loesungsweg: null,
    lebend: true,
    beuteGerettet: false,
    bettlerGeholfen: false,
    bettlerAbgewiesen: false,
    maraGeholfen: false,
    maraAbgewiesen: false,
    schmiedGeholfen: false,
    schmiedAbgewiesen: false,
    mehlsackGefunden: false,
    mehlsackGemeldet: false,
    letzterGastGefunden: false,
    letzterGastAbgewiesen: false,
    kernGeholfen: false,
    kernAbgewiesen: false,
    holmSiegelGefunden: false,
    holmSiegelVerschwiegen: false,
    schnurGeholfen: false,
    schnurAbgewiesen: false,
    sannaGeholfen: false,
    sannaAbgewiesen: false,
    salzGerettet: false,
    salzLiegenGelassen: false,
    glockeGestoppt: false,
    glockeGescheitert: false,
    artefaktErhalten: false,
    artefaktVerloren: false,
    artefaktWeg: null,
    muehleBesucht: false,
    spurenGefunden: false,
    muellerVertraut: false,
    bertokBedraengt: false,
    leneBedraengt: false,
    sennaBesuche: 0,
    fluechtlingeEntdeckt: false,
    renniksBeweis: false,
    rennikGewarnt: false,
    loesungswegMuehle: null,
    truebungBestaetigt: false,
    spurAmBrunnen: false,
    dennekEntlarvt: false,
    grovinGenannt: false,
    grovinsGrund: false,
    grovinGeflohen: false,
    grovinVersprechen: false,
    loesungswegBrunnen: null,
    gasseBesucht: false,
    fennGedraengt: false,
    gasseGeschichteGehoert: false,
    gasseSpielzeugGefunden: false,
    gasseOrtGesehen: false,
    greteGespraech: false,
    greteBedraengt: false,
    ilsesAufzeichnungenGefunden: false,
    vahlGrossvater: false,
    kuesterGewarnt: false,
    vahlKonfrontiert: false,
    loesungswegGasse: null,
    todesort: null,
    effekte: [],
    mal: "",
    entscheidungen: [],
    karten: [],
    tageszeit: "daemmerung",
    spieltag: 1,
  };
}

export function cloneHeld(held: Held): Held {
  return {
    ...held,
    inventar: [...held.inventar],
    effekte: [...(held.effekte ?? [])],
    entscheidungen: [...(held.entscheidungen ?? [])],
    karten: [...(held.karten ?? [])],
  };
}

export function tot(held: Held): boolean {
  return held.lp <= 0 || !held.lebend;
}
