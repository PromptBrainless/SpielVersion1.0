import { z } from "zod";
import type { ArtKey, EffektId, PortraitKey, SceneView } from "./types";
import { readLocalPack } from "./text-pack";

export const WELT_FLAG = "lindendorf.welt.an";
export const WELT_STORE = "lindendorf.welt.v2";
const WELT_MIGRATION = "lindendorf.welt.v2.migrated";
const ALT_FLAG = "lindendorf.spielleiter.an";
const ALT_KARTEN = "lindendorf.spielleiter.karten.v1";
const ALT_AUTHOR = "lindendorf-author-v1";

const TextStandSchema = z.object({
  title: z.string().optional(),
  lines: z.array(z.string()).optional(),
  choices: z.array(z.string()).optional(),
});

export const WeltAuflageSchema = z.object({
  title: z.string().optional(),
  art: z.string().optional(),
  portrait: z.union([z.string(), z.null()]).optional(),
  artSrc: z.string().optional(),
  portraitSrc: z.string().optional(),
  lines: z.array(z.string()).optional(),
  choices: z.array(z.string()).optional(),
  effekte: z.array(z.string()).optional(),
  effekteFort: z.array(z.string()).optional(),
  vorherigerText: TextStandSchema.optional(),
});

export const WeltPackSchema = z.object({
  version: z.literal(2),
  karten: z.record(z.string(), WeltAuflageSchema),
});

export type WeltAuflage = {
  title?: string;
  art?: ArtKey;
  portrait?: PortraitKey | null;
  artSrc?: string;
  portraitSrc?: string;
  lines?: string[];
  choices?: string[];
  effekte?: EffektId[];
  effekteFort?: EffektId[];
  vorherigerText?: { title?: string; lines?: string[]; choices?: string[] };
};

export type KartePatch = WeltAuflage;

export type WeltPack = { version: 2; karten: Record<string, WeltAuflage> };

function leer(): WeltPack {
  return { version: 2, karten: {} };
}

function alsPack(value: unknown): WeltPack {
  const parsed = WeltPackSchema.safeParse(value);
  if (!parsed.success) return leer();
  return parsed.data as WeltPack;
}

export function weltAktiv(): boolean {
  if (typeof window === "undefined") return false;
  const query = new URLSearchParams(window.location.search);
  if (query.has("welt") || query.has("spielleiter") || query.has("gm")) return true;
  try {
    return window.localStorage.getItem(WELT_FLAG) === "1" || window.localStorage.getItem(ALT_FLAG) === "1";
  } catch {
    return false;
  }
}

export function setzeWeltAktiv(an: boolean) {
  try {
    if (an) {
      window.localStorage.setItem(WELT_FLAG, "1");
      window.localStorage.setItem(ALT_FLAG, "1");
    } else {
      window.localStorage.removeItem(WELT_FLAG);
      window.localStorage.removeItem(ALT_FLAG);
      window.localStorage.removeItem(ALT_AUTHOR);
    }
  } catch {
    /* privater Modus */
  }
}

export function karteSchluessel(view: Pick<SceneView, "title" | "lines" | "choices">): string {
  const roh = `${view.title}\n${view.lines.join("\n")}\n—\n${view.choices.join("\n")}`;
  let hash = 2166136261;
  for (let i = 0; i < roh.length; i += 1) {
    hash ^= roh.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `k${(hash >>> 0).toString(16)}`;
}

export function sichtSchluessel(view: SceneView): string[] {
  const keys: string[] = [];
  if (view.id) keys.push(view.id);
  keys.push(karteSchluessel(view));
  if (view.original) {
    const orig = karteSchluessel({
      title: view.original.title,
      lines: view.original.lines,
      choices: view.original.choices,
    });
    if (!keys.includes(orig)) keys.push(orig);
  }
  return keys;
}

function liesAltKarten(): Record<string, WeltAuflage> {
  try {
    const roh = window.localStorage.getItem(ALT_KARTEN);
    if (!roh) return {};
    const gelesen = JSON.parse(roh) as Record<string, WeltAuflage>;
    return gelesen && typeof gelesen === "object" ? gelesen : {};
  } catch {
    return {};
  }
}

function migriere(): WeltPack {
  const pack = leer();
  const alt = liesAltKarten();
  for (const [key, wert] of Object.entries(alt)) {
    if (wert && Object.keys(wert).length) pack.karten[key] = wert;
  }
  try {
    const lokal = readLocalPack();
    for (const [key, eintrag] of Object.entries(lokal.patches)) {
      if (!eintrag?.patch) continue;
      const bisher = pack.karten[key] ?? {};
      pack.karten[key] = {
        ...bisher,
        title: bisher.title ?? eintrag.patch.title,
        lines: bisher.lines ?? eintrag.patch.lines,
        choices: bisher.choices ?? eintrag.patch.choices,
      };
    }
  } catch {
    /* ohne Text-Pack */
  }
  return pack;
}

export function ladeWelt(): WeltPack {
  if (typeof window === "undefined") return leer();
  try {
    const roh = window.localStorage.getItem(WELT_STORE);
    if (roh) {
      const pack = alsPack(JSON.parse(roh) as unknown);
      if (window.localStorage.getItem(WELT_MIGRATION) === "1") return pack;
    }
    const merged = roh ? alsPack(JSON.parse(roh) as unknown) : leer();
    const alt = migriere();
    for (const [key, wert] of Object.entries(alt.karten)) {
      if (!merged.karten[key]) merged.karten[key] = wert;
    }
    window.localStorage.setItem(WELT_STORE, JSON.stringify(merged));
    window.localStorage.setItem(WELT_MIGRATION, "1");
    return merged;
  } catch {
    return leer();
  }
}

function schreibeWelt(pack: WeltPack) {
  try {
    window.localStorage.setItem(WELT_STORE, JSON.stringify(pack));
    window.localStorage.setItem(WELT_MIGRATION, "1");
    return true;
  } catch {
    return false;
  }
}

export function auflageLeer(auflage: WeltAuflage | undefined): boolean {
  if (!auflage) return true;
  const { vorherigerText: _, ...rest } = auflage;
  return !Object.values(rest).some((wert) => {
    if (wert == null) return false;
    if (Array.isArray(wert)) return wert.length > 0;
    if (typeof wert === "string") return wert.trim().length > 0;
    return true;
  });
}

export function auflageFuerSicht(view: SceneView): { schluessel: string; patch: WeltAuflage; bruechig: boolean } {
  const alle = ladeWelt().karten;
  const keys = sichtSchluessel(view);
  for (const key of keys) {
    if (alle[key] && !auflageLeer(alle[key])) {
      return { schluessel: key, patch: alle[key]!, bruechig: !view.id };
    }
  }
  const titelTreffer = Object.entries(alle).filter(([, patch]) => patch.title && patch.title === view.title && !auflageLeer(patch));
  if (titelTreffer.length === 1) {
    return { schluessel: titelTreffer[0]![0], patch: titelTreffer[0]![1], bruechig: !view.id };
  }
  return { schluessel: view.id ?? keys[0] ?? karteSchluessel(view), patch: {}, bruechig: !view.id };
}

function textStand(patch: WeltAuflage, original?: Pick<SceneView, "title" | "lines" | "choices">) {
  return {
    title: patch.title ?? original?.title,
    lines: patch.lines ?? original?.lines,
    choices: patch.choices ?? original?.choices,
  };
}

export function merkeAuflage(
  schluessel: string,
  patch: WeltAuflage,
  original?: Pick<SceneView, "title" | "lines" | "choices">,
) {
  const pack = ladeWelt();
  const bisher = pack.karten[schluessel] ?? {};
  const { vorherigerText: _drop, ...ohneVerlauf } = patch;
  pack.karten[schluessel] = {
    ...ohneVerlauf,
    vorherigerText: bisher.vorherigerText ?? textStand(bisher, original),
  };
  return schreibeWelt(pack);
}

export function loescheAuflage(schluessel: string) {
  const pack = ladeWelt();
  delete pack.karten[schluessel];
  schreibeWelt(pack);
}

export function rueckgaengigAuflage(schluessel: string): WeltAuflage | null {
  const pack = ladeWelt();
  const bisher = pack.karten[schluessel];
  if (!bisher?.vorherigerText) return null;
  const { vorherigerText, ...rest } = bisher;
  pack.karten[schluessel] = {
    ...rest,
    title: vorherigerText.title,
    lines: vorherigerText.lines,
    choices: vorherigerText.choices,
  };
  schreibeWelt(pack);
  return pack.karten[schluessel]!;
}

export function anzahlAuflagen(): number {
  return Object.values(ladeWelt().karten).filter((item) => !auflageLeer(item)).length;
}

export function hatAuflage(schluessel: string): boolean {
  return !auflageLeer(ladeWelt().karten[schluessel]);
}

function uniqueIds(ids: EffektId[]): EffektId[] | undefined {
  const next = [...new Set(ids)];
  return next.length ? next : undefined;
}

export function wendePatchAn(view: SceneView, patch: WeltAuflage | null | undefined): SceneView {
  if (!patch) return view;
  const portrait = patch.portrait === null ? undefined : ((patch.portrait as PortraitKey | undefined) ?? view.portrait);
  const choices = patch.choices?.length
    ? view.choices.map((alt, index) => patch.choices?.[index]?.trim() || alt)
    : view.choices;
  return {
    ...view,
    title: patch.title?.trim() || view.title,
    art: (patch.art as ArtKey | undefined) ?? view.art,
    portrait,
    artSrc: patch.artSrc?.trim() || view.artSrc,
    portraitSrc: patch.portraitSrc?.trim() || view.portraitSrc,
    lines: patch.lines?.map((line) => line.trim()).filter(Boolean) ?? view.lines,
    choices,
    seiteHinzu: uniqueIds([...(view.seiteHinzu ?? []), ...((patch.effekte as EffektId[] | undefined) ?? [])]),
    seiteFort: uniqueIds([...(view.seiteFort ?? []), ...((patch.effekteFort as EffektId[] | undefined) ?? [])]),
  };
}

export function kanonDiff(
  original: Pick<SceneView, "title" | "lines" | "choices">,
  patch: WeltAuflage,
): { titel: boolean; zeilen: { kanon: string; auflage: string }[]; wahlen: { kanon: string; auflage: string }[] } {
  const zeilen: { kanon: string; auflage: string }[] = [];
  const kanonZeilen = original.lines;
  const auflageZeilen = patch.lines ?? original.lines;
  const n = Math.max(kanonZeilen.length, auflageZeilen.length);
  for (let i = 0; i < n; i += 1) {
    const kanon = kanonZeilen[i] ?? "";
    const auflage = auflageZeilen[i] ?? "";
    if (kanon !== auflage) zeilen.push({ kanon, auflage });
  }
  const wahlen: { kanon: string; auflage: string }[] = [];
  const auflageWahlen = patch.choices ?? original.choices;
  original.choices.forEach((kanon, i) => {
    const auflage = auflageWahlen[i] ?? kanon;
    if (kanon !== auflage) wahlen.push({ kanon, auflage });
  });
  return {
    titel: Boolean(patch.title && patch.title !== original.title),
    zeilen,
    wahlen,
  };
}

/** @deprecated Namen aus dem Spielleiter-Stand */
export const ladeKarten = () => ladeWelt().karten;
export const patchFuerSicht = auflageFuerSicht;
export const speichereKarte = (schluessel: string, patch: WeltAuflage) => merkeAuflage(schluessel, patch);
export const loescheKarte = loescheAuflage;
export const spielleiterAktiv = weltAktiv;
export const setzeSpielleiterAktiv = setzeWeltAktiv;
