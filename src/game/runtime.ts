import { applyPatch, fingerprint, lookupPatch } from "./text-pack";
import { PORTRAITS } from "./art";
import { fundFuerSzene, zeilenAusKanon } from "./json/baum";
import { loesePortrait } from "./portrait";
import { sprecherAusZeilen } from "./sprecher";
import { cloneHeld, type ArtKey, type EffektId, type Held, type PortraitKey, type SceneView } from "./types";
import { ortZustand, wendeEffektListenAn, wendeOrtWechselAn } from "./seiten-zustaende";
import { synchronisiereLog } from "./taten";
import { szeneSchluessel, idFuerTitel } from "./szenen-katalog";

type PresentInput = {
  id?: string;
  title?: string;
  art?: ArtKey;
  portrait?: PortraitKey | null;
  artSrc?: string;
  portraitSrc?: string;
  lines: string[];
  held?: Held;
  probe?: SceneView["probe"];
  log?: string[];
  ending?: string;
  choices?: string[];
  effekte?: EffektId[];
  effekteFort?: EffektId[];
};

export class Runtime {
  private generation = 0;
  private waiter: ((n: number) => void) | null = null;
  lastArt: ArtKey = "title";
  lastTitle = "Lindendorf";
  lastPortrait: PortraitKey | undefined;
  lastId: string | undefined;
  lastIdStabil = false;

  constructor(
    private readonly setView: (view: SceneView) => void,
    private readonly setHeld: (held: Held) => void,
  ) {}

  cancel() {
    this.generation += 1;
    this.waiter = null;
  }

  choose(index: number) {
    const wait = this.waiter;
    this.waiter = null;
    wait?.(index);
  }

  async present(input: PresentInput): Promise<number> {
    const gen = this.generation;
    const vorherArt = this.lastArt;
    const titel = input.title ?? this.lastTitle;
    const gefunden = loeseSzeneId(input.id, input.title, this.lastId, this.lastIdStabil, titel);
    const portrait =
      loesePortrait({
        gesetzt: input.portrait,
        kanon: portraitAusKanon(gefunden.id, input.title),
        artWechsel: Boolean(input.art && input.art !== this.lastArt),
        seitenWechsel: Boolean(gefunden.id !== this.lastId || (input.title && input.title !== this.lastTitle)),
        zuletzt: this.lastPortrait,
      }) ?? sprecherAusZeilen(input.lines);
    if (input.art) this.lastArt = input.art;
    if (input.title) this.lastTitle = input.title;
    this.lastId = gefunden.id;
    this.lastIdStabil = gefunden.stabil;
    this.lastPortrait = portrait;

    const art = this.lastArt;
    const ort = ortZustand(art);
    if (input.held) {
      synchronisiereLog(input.held, gefunden.id);
      if (gefunden.id) {
        if (!input.held.karten) input.held.karten = [];
        if (!input.held.karten.includes(gefunden.id)) input.held.karten.push(gefunden.id);
      }
      if (input.art && input.art !== vorherArt) {
        wendeOrtWechselAn(input.held, vorherArt, input.art);
      }
      wendeEffektListenAn(input.held, input.effekte, input.effekteFort);
      this.setHeld(cloneHeld(input.held));
    }

    const original = {
      title: input.title ?? this.lastTitle,
      lines: zeilenAusKanon(gefunden.id, input.title ?? this.lastTitle, input.lines),
      choices: input.choices ?? ["Weiter"],
    };
    const shown = applyPatch(original, lookupPatch(original));
    const view: SceneView = {
      id: gefunden.id,
      idStabil: gefunden.stabil,
      title: shown.title,
      art,
      portrait,
      artSrc: input.artSrc,
      portraitSrc: input.portraitSrc,
      lines: shown.lines,
      held: input.held ? cloneHeld(input.held) : undefined,
      probe: input.probe,
      log: input.log,
      ending: input.ending,
      choices: shown.choices,
      textKey: fingerprint(original),
      original,
      seiteHinzu: ort.hinzu,
      seiteNimmt: ort.nimmt,
      seiteFort: ort.fort,
    };
    this.setView(view);

    return new Promise((resolve) => {
      this.waiter = (index) => {
        if (gen !== this.generation) return;
        resolve(index);
      };
    });
  }
}

function loeseSzeneId(
  gesetzt: string | undefined,
  titelNeu: string | undefined,
  zuletzt: string | undefined,
  zuletztStabil: boolean,
  titel: string,
): { id: string; stabil: boolean } {
  if (gesetzt) return { id: gesetzt, stabil: true };
  const ausTitel = idFuerTitel(titelNeu);
  if (ausTitel) return { id: ausTitel, stabil: true };
  if (!titelNeu && zuletzt) return { id: zuletzt, stabil: zuletztStabil };
  return { id: szeneSchluessel(titel), stabil: false };
}

function portraitAusKanon(id?: string, titel?: string): PortraitKey | null | undefined {
  const fund = fundFuerSzene(id, titel);
  if (!fund) return undefined;
  const key = fund.szene.portrait;
  if (!key) return null;
  return key in PORTRAITS ? (key as PortraitKey) : null;
}
