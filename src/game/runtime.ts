import { applyPatch, fingerprint, lookupPatch } from "./text-pack";
import { cloneHeld, type ArtKey, type EffektId, type Held, type PortraitKey, type SceneView } from "./types";
import { ortZustand, wendeEffektListenAn, wendeOrtWechselAn } from "./seiten-zustaende";
import { synchronisiereLog } from "./taten";

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
    if (input.art) this.lastArt = input.art;
    if (input.title) this.lastTitle = input.title;
    if (input.portrait === null) this.lastPortrait = undefined;
    else if (input.portrait) this.lastPortrait = input.portrait;

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
      id: input.id,
      title: shown.title,
      art,
      portrait: input.portrait === null ? undefined : (input.portrait ?? this.lastPortrait),
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
