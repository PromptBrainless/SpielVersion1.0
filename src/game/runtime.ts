import { applyPatch, fingerprint, lookupPatch } from "./text-pack";
import { PORTRAITS } from "./art";
import { fundFuerSzene } from "./json/baum";
import { loesePortrait } from "./portrait";
import { sprecherAusZeilen } from "./sprecher";
import { cloneHeld, type ArtKey, type EffektId, type Held, type PortraitKey, type SceneView } from "./types";
import { ortZustand, wendeEffektListenAn, wendeOrtWechselAn } from "./seiten-zustaende";
import { synchronisiereLog } from "./taten";
import { szeneSchluessel } from "./szenen-katalog";

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
    const portrait =
      loesePortrait({
        gesetzt: input.portrait,
        kanon: portraitAusKanon(input.id, input.title),
        artWechsel: Boolean(input.art && input.art !== this.lastArt),
        seitenWechsel: Boolean((input.id && input.id !== this.lastId) || (input.title && input.title !== this.lastTitle)),
        zuletzt: this.lastPortrait,
      }) ?? sprecherAusZeilen(input.lines);
    if (input.art) this.lastArt = input.art;
    if (input.title) this.lastTitle = input.title;
    if (input.id) this.lastId = input.id;
    this.lastPortrait = portrait;

    const art = this.lastArt;
    const ort = ortZustand(art);
    if (input.held) {
      synchronisiereLog(input.held, input.id ?? input.title ?? this.lastTitle);
      if (input.art && input.art !== vorherArt) {
        wendeOrtWechselAn(input.held, vorherArt, input.art);
      }
      wendeEffektListenAn(input.held, input.effekte, input.effekteFort);
      this.setHeld(cloneHeld(input.held));
    }

    const original = {
      title: input.title ?? this.lastTitle,
      lines: input.lines,
      choices: input.choices ?? ["Weiter"],
    };
    const shown = applyPatch(original, lookupPatch(original));
    const view: SceneView = {
      id: input.id ?? szeneSchluessel(original.title),
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

function portraitAusKanon(id?: string, titel?: string): PortraitKey | null | undefined {
  const fund = fundFuerSzene(id, titel);
  if (!fund) return undefined;
  const key = fund.szene.portrait;
  if (!key) return null;
  return key in PORTRAITS ? (key as PortraitKey) : null;
}
