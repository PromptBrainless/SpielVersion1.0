export type MangelArt = "leer" | "kurz" | "stichpunkt" | "bild" | "portrait";

export type SzenenMangel = {
  id: string;
  quest: string;
  titel: string;
  grund: MangelArt;
  chars: number;
};

export const KURZ_GRENZE = 160;

export function istStichpunkt(zeile: string) {
  const text = zeile.trim();
  if (!text) return false;
  return /^\s*[-*•–]\s/.test(zeile) || /^\s*\d+[.)]\s/.test(zeile);
}

export function zeilenMass(lines: string[]) {
  const sauber = lines.map((zeile) => zeile.trim()).filter(Boolean);
  const chars = sauber.join(" ").length;
  return {
    sauber,
    chars,
    leer: sauber.length === 0,
    kurz: sauber.length > 0 && chars < KURZ_GRENZE,
    stichpunkt: sauber.some(istStichpunkt),
  };
}

export function pruefeSzeneText(
  szene: { id: string; title: string; lines?: string[] },
  quest = "",
): SzenenMangel[] {
  const mass = zeilenMass(szene.lines ?? []);
  const mangel: SzenenMangel[] = [];
  if (mass.leer) mangel.push({ id: szene.id, quest, titel: szene.title, grund: "leer", chars: 0 });
  else if (mass.kurz) mangel.push({ id: szene.id, quest, titel: szene.title, grund: "kurz", chars: mass.chars });
  if (mass.stichpunkt) mangel.push({ id: szene.id, quest, titel: szene.title, grund: "stichpunkt", chars: mass.chars });
  return mangel;
}

export function pruefeSzeneBild(
  szene: { id: string; title: string; art: string; portrait?: string | null },
  artKeys: Set<string>,
  portraitKeys: Set<string>,
  quest = "",
): SzenenMangel[] {
  const mangel: SzenenMangel[] = [];
  if (!artKeys.has(szene.art)) mangel.push({ id: szene.id, quest, titel: szene.title, grund: "bild", chars: 0 });
  if (szene.portrait && !portraitKeys.has(szene.portrait)) {
    mangel.push({ id: szene.id, quest, titel: szene.title, grund: "portrait", chars: 0 });
  }
  return mangel;
}
