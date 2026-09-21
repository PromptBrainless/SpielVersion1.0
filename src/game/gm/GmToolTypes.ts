import type { Entscheidung } from "../heldSchema";
import type { ArtKey, BrunnenWeg, EffektId, GasseWeg, Held, Loesungsweg, MuehleWeg, PortraitKey, Tageszeit, Todesort } from "../types";
import type { WeltAuflage } from "../welt";
import type { ProbenAktion } from "../zeitModifikatoren";

/** GameState: Held ist die Wahrheit des Tals. Keine Flag-Umbenennung. */
export type GameState = {
  held: Held;
  karte: KartenState | null;
};

export type KartenState = {
  id: string;
  title: string;
  art: ArtKey;
  portrait: PortraitKey | null;
  lines: string[];
  choices: string[];
  artSrc?: string;
  portraitSrc?: string;
  stand: "kanon" | "auflage";
};

export type PlayerHudState = {
  name: string;
  lp: number;
  maxLp: number;
  st: number;
  ge: number;
  ch: number;
  stBasis: number;
  geBasis: number;
  chBasis: number;
  gold: number;
  inventar: string[];
  gunst: string[];
  last: string[];
  mal: string;
  tageszeit: Tageszeit;
  spieltag: number;
  lebend: boolean;
  wissen: string[];
};

export type GmToolState = {
  stand: "kanon" | "auflage";
  held: Held | null;
  karte: KartenState | null;
  vorschau: GmCommandVorschau | null;
};

export type GmCommand =
  | { art: "effekt"; id: EffektId; an: boolean }
  | { art: "tageszeit"; zeit: Tageszeit }
  | { art: "auflage"; schluessel: string; patch: WeltAuflage }
  | { art: "lage"; frageIndex: number }
  | { art: "probe"; attribut: "staerke" | "geschick" | "charisma"; aktion?: ProbenAktion; schwelle: 8 | 12 | 15; nebel: boolean };

export type GmCommandVorschau = {
  art: GmCommand["art"];
  satz: string;
  trifft: "held" | "auflage" | "probe";
};

export const SPIELER_VERBOTEN = [
  "loesungsweg",
  "loesungswegMuehle",
  "loesungswegBrunnen",
  "loesungswegGasse",
  "artefaktWeg",
  "todesort",
] as const;

export type SpielerVerboten = (typeof SPIELER_VERBOTEN)[number];

/** Übernommene Flag-Namen aus Held — unverändert. */
export const HELD_STATE_FELDER = [
  "name",
  "staerke",
  "geschick",
  "charisma",
  "lp",
  "inventar",
  "gold",
  "banditenGewarnt",
  "buergermeisterVertraut",
  "verwundet",
  "holmBesucht",
  "auftragErhalten",
  "lagerGeloest",
  "loesungsweg",
  "lebend",
  "beuteGerettet",
  "bettlerGeholfen",
  "bettlerAbgewiesen",
  "maraGeholfen",
  "maraAbgewiesen",
  "schmiedGeholfen",
  "schmiedAbgewiesen",
  "mehlsackGefunden",
  "mehlsackGemeldet",
  "letzterGastGefunden",
  "letzterGastAbgewiesen",
  "kernGeholfen",
  "kernAbgewiesen",
  "holmSiegelGefunden",
  "holmSiegelVerschwiegen",
  "schnurGeholfen",
  "schnurAbgewiesen",
  "sannaGeholfen",
  "sannaAbgewiesen",
  "salzGerettet",
  "salzLiegenGelassen",
  "glockeGestoppt",
  "glockeGescheitert",
  "artefaktErhalten",
  "artefaktVerloren",
  "artefaktWeg",
  "muehleBesucht",
  "spurenGefunden",
  "muellerVertraut",
  "bertokBedraengt",
  "leneBedraengt",
  "sennaBesuche",
  "fluechtlingeEntdeckt",
  "renniksBeweis",
  "rennikGewarnt",
  "loesungswegMuehle",
  "truebungBestaetigt",
  "spurAmBrunnen",
  "dennekEntlarvt",
  "grovinGenannt",
  "grovinsGrund",
  "grovinGeflohen",
  "grovinVersprechen",
  "loesungswegBrunnen",
  "gasseBesucht",
  "fennGedraengt",
  "gasseGeschichteGehoert",
  "gasseSpielzeugGefunden",
  "gasseOrtGesehen",
  "greteGespraech",
  "greteBedraengt",
  "ilsesAufzeichnungenGefunden",
  "vahlGrossvater",
  "kuesterGewarnt",
  "vahlKonfrontiert",
  "loesungswegGasse",
  "todesort",
  "effekte",
  "mal",
  "entscheidungen",
  "tageszeit",
  "spieltag",
] as const;

export const KARTEN_STATE_FELDER = [
  "id",
  "title",
  "art",
  "portrait",
  "lines",
  "choices",
  "artSrc",
  "portraitSrc",
  "stand",
] as const;

export type HeldStateFeld = (typeof HELD_STATE_FELDER)[number];
export type KartenStateFeld = (typeof KARTEN_STATE_FELDER)[number];

export type HeldLoesungsFlags = {
  loesungsweg: Loesungsweg;
  loesungswegMuehle: MuehleWeg;
  loesungswegBrunnen: BrunnenWeg;
  loesungswegGasse: GasseWeg;
  artefaktWeg: Loesungsweg;
  todesort: Todesort;
};

export type HeldLog = Entscheidung[];
