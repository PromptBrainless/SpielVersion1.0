import { ART } from "./art";
import { QUESTS } from "./json/baum";
import { deriveKnowledge, type KnowledgeKey } from "./knowledge";
import type { ArtKey, Held } from "./types";
import { wissenTafelFuer } from "./wissen-tafeln";

export type FokusBild = { art: "bild"; src: string; titel: string };
export type FokusWissen = { art: "wissen"; title: string; lines: string[]; hintergrund: string };
export type FokusQuest = { art: "quest"; title: string; lines: string[]; hintergrund: string };
export type FokusEintrag = FokusBild | FokusWissen | FokusQuest;

export type QuestWegFeld = "loesungswegMuehle" | "loesungswegBrunnen" | "loesungswegGasse" | "loesungsweg";

const QUEST_FELD: { feld: QuestWegFeld; quest: string }[] = [
  { feld: "loesungswegMuehle", quest: "muehle" },
  { feld: "loesungswegBrunnen", quest: "brunnen" },
  { feld: "loesungswegGasse", quest: "gasse" },
  { feld: "loesungsweg", quest: "lager" },
];

const END_SZENE: Record<string, Record<string, string>> = {
  muehle: {
    kampf: "mehl-mit-rauen-haenden",
    schleich: "stilles-mehl",
    verhandelt: "sicheres-mehl-leere-blicke",
    verraten: "sicheres-mehl-leere-blicke",
  },
  brunnen: {
    zerstoert: "wasser-mit-einem-riss",
    geoeffnet: "klares-wasser",
    verhandelt: "klares-wasser",
    bestochen: "zwei-brunnen-ein-dorf",
  },
  gasse: {
    veroeffentlicht: "ein-name-unter-vielen",
    weitergegeben: "was-die-liste-wiegt",
    erpresst: "stille-rechnung",
    vernichtet: "ein-zweites-schweigen",
  },
};

const STAMM_WISSEN: KnowledgeKey[] = ["dorf_ankunft", "artefakt_gesehen"];

export function neuesWissen(vorher: Held | null | undefined, jetzt: Held): KnowledgeKey[] {
  const alt = vorher ? deriveKnowledge(vorher) : new Set<KnowledgeKey>(STAMM_WISSEN);
  const neu = deriveKnowledge(jetzt);
  return [...neu].filter((key) => !alt.has(key));
}

export function neueQuest(vorher: Held | null | undefined, jetzt: Held): { quest: string; wert: string } | null {
  for (const { feld, quest } of QUEST_FELD) {
    const alt = vorher?.[feld];
    const wert = jetzt[feld];
    if (!alt && wert) return { quest, wert: String(wert) };
  }
  return null;
}

export function questGeschichte(questId: string, endeWert?: string): FokusQuest | null {
  const quest = QUESTS.find((item) => item.id === questId);
  if (!quest) return null;
  const endeId = endeWert ? END_SZENE[questId]?.[endeWert] : undefined;
  const gesehen = new Set<string>();
  const lines: string[] = [];
  let art: ArtKey = "village";
  for (const teil of quest.teile) {
    const istEnde = teil.id === "ende" || teil.id === "schluss";
    for (const szene of teil.szenen) {
      if (istEnde && endeId && szene.id !== endeId) continue;
      if (istEnde && !endeId) continue;
      if (!istEnde && szene.art) art = szene.art as ArtKey;
      for (const zeile of szene.lines ?? []) {
        const text = zeile.trim();
        if (text.length < 40 || gesehen.has(text)) continue;
        gesehen.add(text);
        lines.push(text);
      }
    }
  }
  if (!lines.length) return null;
  return {
    art: "quest",
    title: quest.titel,
    lines,
    hintergrund: ART[art] ?? ART.village,
  };
}

export function wissenFokus(keys: KnowledgeKey[]): FokusWissen[] {
  return keys.map((key) => {
    const tafel = wissenTafelFuer(key);
    return {
      art: "wissen" as const,
      title: tafel.title,
      lines: tafel.lines,
      hintergrund: tafel.bild,
    };
  });
}
