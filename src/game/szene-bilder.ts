/** Szenen-Id → Dateiname unter public/art/wissen, wenn er vom Id abweicht. */
const BILD_ALIAS: Record<string, string> = {
  "dorf-hub": "lindendorf",
  "sanna-botin": "sanna-die-botin",
  "am-brunnen": "brunnen-hub",
  "intro-fremder-am-weg": "der-fremde-am-weg",
};

/** Eigenes Bühnenbild, unabhängig vom ArtKey. */
const BILD_EIGEN: Record<string, string> = {
  "intro-hang": "/art/intro-hang.jpg",
  "fenn-an-der-kirchmauer": "/art/fenn-kirchmauer.jpg",
  fenn: "/art/fenn-kirchmauer.jpg",
};

export function szeneBildName(id?: string): string | undefined {
  if (!id) return undefined;
  return BILD_ALIAS[id] ?? id;
}

export function szeneWissenPfad(id?: string): string | undefined {
  if (!id) return undefined;
  if (BILD_EIGEN[id]) return BILD_EIGEN[id];
  const name = szeneBildName(id);
  return name ? `/art/wissen/${name}.jpg` : undefined;
}

export function szeneBildSrc(id?: string, _art?: string, override?: string): string | undefined {
  const extra = override?.trim();
  if (extra) return extra;
  return szeneWissenPfad(id);
}
