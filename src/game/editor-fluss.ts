import { INTRO_ARTIFACT_CONTENT, INTRO_WEG_CONTENT } from "./content";
import { LAGER_CONTENT, LAGER_WEGE } from "./lager-content";
import { findDeadNodes } from "./testTools";
import type { ArtKey } from "./types";

export type FlussKante = { id: string; label: string };

export type FlussKnoten = {
  id: string;
  titel: string;
  art: ArtKey;
  zeilen: string[];
  weiter: FlussKante[];
};

export const FLUSS: FlussKnoten[] = [
  {
    id: "intro-weg",
    titel: INTRO_WEG_CONTENT.title,
    art: "road",
    zeilen: INTRO_WEG_CONTENT.lines.slice(0, 4),
    weiter: [{ id: "intro-fremder", label: "Der Fremde" }],
  },
  {
    id: "intro-fremder",
    titel: INTRO_ARTIFACT_CONTENT.title,
    art: "stranger",
    zeilen: INTRO_ARTIFACT_CONTENT.lines.slice(0, 4),
    weiter: [{ id: "dorf", label: "Nach Lindendorf" }],
  },
  {
    id: "dorf",
    titel: "Dorfplatz",
    art: "village",
    zeilen: ["Die Schleife. Holm, Taverne, Brunnen, Mühle, Gasse, Hang, Wald."],
    weiter: [
      { id: "holm", label: "Rathaus" },
      { id: "taverne", label: "Taverne" },
      { id: "brunnen", label: "Brunnen" },
      { id: "muehle", label: "Mühle" },
      { id: "gasse", label: "Gerbereigasse" },
      { id: "glockenweg", label: "Hang" },
      { id: "wald", label: "Wald" },
      { id: "warten", label: "Warten" },
    ],
  },
  {
    id: "holm",
    titel: "Rathaus",
    art: "townhall",
    zeilen: ["Holm, Auftrag, Siegel."],
    weiter: [{ id: "dorf", label: "Zurück" }],
  },
  {
    id: "taverne",
    titel: "Taverne",
    art: "tavern",
    zeilen: ["Mara, Gerüchte, letzter Gast."],
    weiter: [{ id: "dorf", label: "Zurück" }],
  },
  {
    id: "brunnen",
    titel: "Brunnen",
    art: "well",
    zeilen: ["Trüber Eimer. Einstieg ins trübe Wasser."],
    weiter: [{ id: "dorf", label: "Zurück" }],
  },
  {
    id: "muehle",
    titel: "Mühle",
    art: "mill",
    zeilen: ["Die Schuld der Mühle."],
    weiter: [{ id: "dorf", label: "Zurück" }],
  },
  {
    id: "gasse",
    titel: "Gerbereigasse",
    art: "village",
    zeilen: ["Das Kesseljahr."],
    weiter: [{ id: "dorf", label: "Zurück" }],
  },
  {
    id: "warten",
    titel: "Warten",
    art: "village",
    zeilen: ["Die Zeit wendet sich. Das Dorf bleibt."],
    weiter: [{ id: "dorf", label: "Weiter" }],
  },
  {
    id: "glockenweg",
    titel: "Alter Glockenweg",
    art: "chapel",
    zeilen: ["Sanna, Jorren, Glocke."],
    weiter: [
      { id: "dorf", label: "Zurück" },
      { id: "wald", label: "Weiter in den Wald" },
    ],
  },
  {
    id: "wald",
    titel: "Wald",
    art: "forest",
    zeilen: ["Nasses Laub. Spuren. Der Steinbruch liegt voraus."],
    weiter: [
      { id: "lager", label: "Zum Steinbruch" },
      { id: "dorf", label: "Umkehren" },
    ],
  },
  {
    id: "lager",
    titel: LAGER_CONTENT.title,
    art: "camp",
    zeilen: LAGER_CONTENT.lines.slice(0, 4),
    weiter: [
      { id: "lager-schleich", label: LAGER_CONTENT.choices[0] },
      { id: "lager-reden", label: LAGER_CONTENT.choices[1] },
      { id: "lager-kampf", label: LAGER_CONTENT.choices[2] },
      { id: "lager-tor", label: LAGER_CONTENT.choiceTor },
    ],
  },
  {
    id: "lager-schleich",
    titel: "Schleichen",
    art: "sneak",
    zeilen: LAGER_WEGE.schleich.erfolg,
    weiter: [{ id: "ende", label: "Ende" }],
  },
  {
    id: "lager-reden",
    titel: "Reden",
    art: "camp",
    zeilen: LAGER_WEGE.reden.drohenErfolg,
    weiter: [{ id: "ende", label: "Ende" }],
  },
  {
    id: "lager-kampf",
    titel: "Kampf",
    art: "combat",
    zeilen: LAGER_WEGE.kampf.sieg,
    weiter: [{ id: "ende", label: "Ende" }],
  },
  {
    id: "lager-tor",
    titel: LAGER_WEGE.tor.title,
    art: "gate",
    zeilen: LAGER_WEGE.tor.beuteErfolg,
    weiter: [{ id: "ende", label: "Ende" }],
  },
  {
    id: "ende",
    titel: "Ende",
    art: "return",
    zeilen: ["Lindendorf sieht dich früher als Holm."],
    weiter: [{ id: "intro-weg", label: "Von vorn" }],
  },
];

export function knoten(id: string): FlussKnoten | undefined {
  return FLUSS.find((item) => item.id === id);
}

export function toteFlussKnoten(): string[] {
  const alle = new Set(FLUSS.map((item) => item.id));
  const referenziert = new Set<string>(["intro-weg"]);
  for (const item of FLUSS) {
    for (const kante of item.weiter) referenziert.add(kante.id);
  }
  return findDeadNodes(alle, referenziert);
}

export function unbekannteKanten(): string[] {
  const alle = new Set(FLUSS.map((item) => item.id));
  const fehlend: string[] = [];
  for (const item of FLUSS) {
    for (const kante of item.weiter) {
      if (!alle.has(kante.id)) fehlend.push(`${item.id} → ${kante.id}`);
    }
  }
  return fehlend;
}
