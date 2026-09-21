import { fundFuerSzene, jsonDerQuest, jsonDerSzene, jsonDesTeils } from "./json/baum";
import { SzeneSchema, TeilSchema, QuestSchema } from "./json/schema";
import { WeltAuflageSchema, type WeltAuflage } from "./welt";
import type { SceneView } from "./types";

export type ModulSchluessel = "szene" | "teil" | "quest" | "auflage";

export type SzenenModul = {
  schluessel: ModulSchluessel;
  label: string;
  datei: string;
  inhalt: (szene: SceneView | null, auflage: WeltAuflage) => string;
  pruefen: (roh: string) => unknown;
};

/** Titel, die im Fluss vorkommen, aber nicht als Kanon-Karte stehen. */
const FESTE_TITEL: Record<string, string> = {
  Lindendorf: "dorf-hub",
  "Was du weißt": "wissen-abreise",
  "Am Brunnen": "am-brunnen",
  "Sanna, die Botin": "sanna-botin",
  "Hinter der Taverne": "hinter-der-taverne",
  "Hinter dem Brunnen": "hinter-dem-brunnen",
  Graben: "graben",
  "Am Schmied": "am-schmied",
  "Brunnen und Dorfplatz": "brunnen-und-dorfplatz",
};

export function idFuerTitel(titel?: string): string | undefined {
  if (!titel) return undefined;
  if (FESTE_TITEL[titel]) return FESTE_TITEL[titel];
  const fund = fundFuerSzene(undefined, titel);
  return fund?.szene.id;
}

export function szeneSchluessel(titel: string) {
  const roh = titel
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return roh || "szene";
}

function liveSzene(szene: SceneView | null, auflage: WeltAuflage) {
  const katalogRoh = szene ? jsonDerSzene(szene.id, szene.title) : null;
  const katalog = katalogRoh ? (JSON.parse(katalogRoh) as Record<string, unknown>) : null;
  const kern = katalog ?? {
    id: szene?.id ?? (szene ? szeneSchluessel(szene.title) : "szene"),
    title: szene?.title ?? "",
    art: szene?.art ?? "village",
    portrait: szene?.portrait ?? null,
    lines: szene?.lines ?? [],
    choices: szene?.choices ?? ["Weiter"],
  };
  return JSON.stringify(
    {
      ...kern,
      title: auflage.title ?? kern.title,
      art: auflage.art ?? kern.art,
      portrait: auflage.portrait === undefined ? kern.portrait : auflage.portrait,
      lines: auflage.lines ?? kern.lines,
      choices: auflage.choices ?? kern.choices,
    },
    null,
    2,
  );
}

export function modulFuerSzene(szene: SceneView | null): SzenenModul {
  return moduleDerSzene(szene)[0]!;
}

export function moduleDerSzene(szene: SceneView | null): SzenenModul[] {
  const fund = fundFuerSzene(szene?.id, szene?.title);
  const szeneDatei = fund?.szene.id ? `${fund.szene.id}.json` : szene?.id ? `${szene.id}.json` : "szene.json";
  const liste: SzenenModul[] = [
    {
      schluessel: "szene",
      label: "Szene",
      datei: szeneDatei,
      inhalt: liveSzene,
      pruefen: (roh) => SzeneSchema.parse(JSON.parse(roh)),
    },
  ];
  if (fund) {
    liste.push({
      schluessel: "teil",
      label: `Teil · ${fund.teil.titel}`,
      datei: fund.teil.datei,
      inhalt: () => jsonDesTeils(szene?.id, szene?.title) ?? "{}",
      pruefen: (roh) => TeilSchema.parse(JSON.parse(roh)),
    });
    liste.push({
      schluessel: "quest",
      label: `Quest · ${fund.quest.titel}`,
      datei: fund.quest.datei,
      inhalt: () => jsonDerQuest(szene?.id, szene?.title) ?? "{}",
      pruefen: (roh) => QuestSchema.parse(JSON.parse(roh)),
    });
  }
  liste.push({
    schluessel: "auflage",
    label: "Auflage",
    datei: "auflage.json",
    inhalt: (_s, auflage) => JSON.stringify(auflage, null, 2),
    pruefen: (roh) => WeltAuflageSchema.parse(JSON.parse(roh)),
  });
  return liste;
}

export function modulNachSchluessel(schluessel: string, szene: SceneView | null = null): SzenenModul | undefined {
  return moduleDerSzene(szene).find((item) => item.schluessel === schluessel);
}

export function dateiDerSzene(szene: SceneView | null) {
  return modulFuerSzene(szene).datei;
}
