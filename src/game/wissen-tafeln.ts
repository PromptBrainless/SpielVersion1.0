import { ART } from "./art";
import { fundFuerSzene, szeneSicht } from "./json/baum";
import { stimmeDatei } from "./json/stimme";
import { wissenDatei } from "./json/wissen";
import { deriveKnowledge, knowledgeLabels, type KnowledgeKey } from "./knowledge";
import { szeneBildName, szeneWissenPfad } from "./szene-bilder";
import type { ArtKey, Held } from "./types";
import { alsZuege } from "./stimme";
import { INNERES, WISSEN_BILD } from "./wissen-inneres";

export type WissenTafel = {
  id: string;
  title: string;
  bild: string;
  offen: boolean;
  lines: string[];
  stimmeSrc?: string;
  stimmen?: import("./stimme").StimmeRoh[];
};

export { INNERES, WISSEN_BILD };

const OFFEN_BILD = "/art/wissen/offen.jpg";

export function wissenBildFuer(id: string, art?: string) {
  const pfad = szeneWissenPfad(id);
  if (pfad) return pfad;
  const name = szeneBildName(id);
  if (name) return `/art/wissen/${name}.jpg`;
  const key = id as KnowledgeKey;
  if (key in WISSEN_BILD) return WISSEN_BILD[key];
  if (art && art in ART) return ART[art as ArtKey];
  return ART.village;
}

function tafelAusDatei(id: string, offen = false): WissenTafel | null {
  const datei = wissenDatei(id);
  if (!datei) return null;
  const zuege = alsZuege(datei.stimmeSrc, datei.stimmen?.length ? datei.stimmen : stimmeDatei(id));
  return {
    id: datei.id,
    title: datei.title,
    bild: datei.bild,
    offen: datei.offen ?? offen,
    lines: datei.lines,
    stimmeSrc: zuege[0]?.src,
    stimmen: zuege.length ? zuege : undefined,
  };
}

export function szeneTafelFuer(id: string): WissenTafel | null {
  const ausDatei = tafelAusDatei(id);
  if (ausDatei) return ausDatei;
  const sicht = szeneSicht(id);
  if (sicht) {
    return {
      id: sicht.id,
      title: sicht.title,
      bild: wissenBildFuer(sicht.id, sicht.art),
      offen: false,
      lines: sicht.lines,
    };
  }
  const fund = fundFuerSzene(id);
  if (!fund) return null;
  return {
    id: fund.szene.id,
    title: fund.szene.title,
    bild: wissenBildFuer(fund.szene.id, fund.szene.art),
    offen: false,
    lines: fund.szene.lines.length
      ? fund.szene.lines
      : ["Du warst hier. Der Ort hat sich noch nicht in Sätzen abgelegt."],
  };
}

export function wissenTafelFuer(key: KnowledgeKey): WissenTafel {
  const ausDatei = tafelAusDatei(key);
  if (ausDatei) return ausDatei;
  const lines = INNERES[key];
  return {
    id: key,
    title: lines[0] ?? "",
    bild: WISSEN_BILD[key],
    offen: false,
    lines,
  };
}

export function wissenTafeln(held: Held): WissenTafel[] {
  const tafeln: WissenTafel[] = [];
  const gesehen = new Set<string>();
  for (const id of held.karten ?? []) {
    const tafel = szeneTafelFuer(id);
    if (!tafel || gesehen.has(tafel.id)) continue;
    gesehen.add(tafel.id);
    tafeln.push(tafel);
  }
  for (const key of deriveKnowledge(held)) {
    if (gesehen.has(key)) continue;
    gesehen.add(key);
    tafeln.push(wissenTafelFuer(key));
  }
  knowledgeLabels(held).offen.forEach((frage, index) => {
    const id = `offen-${index}`;
    tafeln.push(
      tafelAusDatei(id, true) ?? {
        id,
        title: frage,
        bild: OFFEN_BILD,
        offen: true,
        lines: [
          frage,
          "Du hast darauf noch keine Antwort, die vor einem Zeugen bestehen würde. Die Frage selbst bleibt. Sie legt sich an den Rand des nächsten Gesprächs und wartet, bis jemand den Satz zu Ende spricht.",
        ],
      },
    );
  });
  return tafeln;
}
