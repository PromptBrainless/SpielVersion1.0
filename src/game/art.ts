import type { ArtKey, PortraitKey } from "./types";

export const ART: Record<ArtKey, string> = {
  title: "/art/title.jpg",
  road: "/art/road.jpg",
  stranger: "/art/stranger.jpg",
  village: "/art/village.jpg",
  townhall: "/art/townhall.jpg",
  tavern: "/art/tavern.jpg",
  well: "/art/well.jpg",
  mill: "/art/mill.jpg",
  apothecary: "/art/apothecary.jpg",
  smithy: "/art/smithy.jpg",
  forest: "/art/forest.jpg",
  ditch: "/art/ditch.jpg",
  chapel: "/art/chapel.jpg",
  camp: "/art/camp.jpg",
  evidence: "/art/evidence.jpg",
  sneak: "/art/sneak.jpg",
  combat: "/art/combat.jpg",
  gate: "/art/gate.jpg",
  death: "/art/death.jpg",
  return: "/art/return.jpg",
};

export const ART_MOTION: Partial<Record<ArtKey, string>> = {};

export const PORTRAITS: Record<PortraitKey, string> = {
  holm: "/art/holm.jpg",
  mara: "/art/mara.jpg",
  kess: "/art/kess.jpg",
  miller: "/art/miller.jpg",
  kern: "/art/kern.jpg",
  sanna: "/art/sanna.jpg",
  smith: "/art/smith.jpg",
  beggar: "/art/beggar.jpg",
  grovin: "/art/grovin.jpg",
  dennek: "/art/dennek.jpg",
  lene: "/art/lene.jpg",
  vahl: "/art/vahl.jpg",
  grete: "/art/grete.jpg",
  rennik: "/art/rennik.jpg",
  jorren: "/art/jorren.jpg",
};

export const PORTRAIT_MOTION: Partial<Record<PortraitKey, string>> = {};

export function isMotion(src: string) {
  return /\.(mp4|webm)$/i.test(src);
}

export function artSrcFor(art: ArtKey, override?: string) {
  return override || ART_MOTION[art] || ART[art];
}

export function portraitSrcFor(portrait: PortraitKey | undefined, override?: string) {
  const extra = override?.trim();
  if (extra) return extra;
  if (!portrait) return "";
  return PORTRAITS[portrait] ?? "";
}

export function posterFor(src: string, art?: ArtKey) {
  if (!isMotion(src)) return undefined;
  if (art && ART[art]) return ART[art];
  return undefined;
}

export const LAGEN_ART: Record<string, string> = {
  soldateska: "/art/lagen/soldateska.jpg",
  feind: "/art/lagen/feind.jpg",
  ernte: "/art/lagen/ernte.jpg",
  verraeter: "/art/lagen/verraeter.jpg",
  brot: "/art/lagen/brot.jpg",
  seuche: "/art/lagen/seuche.jpg",
  spion: "/art/lagen/spion.jpg",
  waffe: "/art/lagen/waffe.jpg",
  burg: "/art/lagen/burg.jpg",
  ausweg: "/art/lagen/ausweg.jpg",
};

export function lageBild(id?: string) {
  if (!id) return "";
  return LAGEN_ART[id] ?? "";
}
