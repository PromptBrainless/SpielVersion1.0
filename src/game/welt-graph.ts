import { ART, PORTRAITS } from "./art";
import { fundFuerSzene, QUESTS } from "./json/baum";
import { zeilenMass } from "./pruefung-text";
import type { ArtKey, PortraitKey, SceneView } from "./types";

export type GraphKnoten = {
  id: string;
  titel: string;
  quest: string;
  questTitel: string;
  teil: string;
  teilTitel: string;
  x: number;
  y: number;
  chars: number;
  leer: boolean;
  kurz: boolean;
  stichpunkt: boolean;
};

export type GraphKante = { von: string; nach: string };

export type WeltGraphDaten = {
  knoten: GraphKnoten[];
  kanten: GraphKante[];
  breite: number;
  hoehe: number;
  leer: number;
  kurz: number;
  stichpunkt: number;
};

const SPALTE = 176;
const ZEILE = 36;
const LINKS = 24;
const OBEN = 48;

function alsArt(key: string): ArtKey {
  return key in ART ? (key as ArtKey) : "village";
}

function alsPortrait(key: string | null | undefined): PortraitKey | undefined {
  if (!key) return undefined;
  return key in PORTRAITS ? (key as PortraitKey) : undefined;
}

export function viewAusKanon(id: string): SceneView | null {
  const fund = fundFuerSzene(id);
  if (!fund) return null;
  const szene = fund.szene;
  const art = alsArt(szene.art);
  const portrait = alsPortrait(szene.portrait);
  return {
    id: szene.id,
    title: szene.title,
    art,
    portrait,
    artSrc: ART[art],
    portraitSrc: portrait ? PORTRAITS[portrait] : undefined,
    lines: szene.lines,
    choices: szene.choices,
    original: { title: szene.title, lines: szene.lines, choices: szene.choices },
  };
}

export function baueWeltGraph(): WeltGraphDaten {
  const knoten: GraphKnoten[] = [];
  const kanten: GraphKante[] = [];
  let x = LINKS;
  let hoehe = OBEN;
  let leer = 0;
  let kurz = 0;
  let stichpunkt = 0;

  for (const quest of QUESTS) {
    let y = OBEN;
    let vorige: string | null = null;
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) {
        const mass = zeilenMass(szene.lines ?? []);
        knoten.push({
          id: szene.id,
          titel: szene.title,
          quest: quest.id,
          questTitel: quest.titel,
          teil: teil.id,
          teilTitel: teil.titel,
          x,
          y,
          chars: mass.chars,
          leer: mass.leer,
          kurz: mass.kurz,
          stichpunkt: mass.stichpunkt,
        });
        if (mass.leer) leer += 1;
        else if (mass.kurz) kurz += 1;
        if (mass.stichpunkt) stichpunkt += 1;
        if (vorige) kanten.push({ von: vorige, nach: szene.id });
        vorige = szene.id;
        y += ZEILE;
      }
      y += 12;
    }
    hoehe = Math.max(hoehe, y);
    x += SPALTE;
  }

  return { knoten, kanten, breite: x, hoehe: hoehe + 16, leer, kurz, stichpunkt };
}
