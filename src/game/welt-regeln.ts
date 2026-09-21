import { ART, PORTRAITS } from "./art";
import { FLUSS } from "./editor-fluss";
import { EFFEKT_IDS, type EffektId } from "./effekte";
import { HERKUNFT_FRAGEN } from "./herkunft";
import { QUESTS } from "./json/baum";
import { sprecherAusZeilen } from "./sprecher";
import { zeilenMass } from "./pruefung-text";
import { ORT_ZUSTAENDE } from "./seiten-zustaende";

export type RegelArt = "fehler" | "warnung" | "info";

export type RegelFund = {
  art: RegelArt;
  id?: string;
  titel?: string;
  text: string;
};

export type BibliothekZeile = {
  id: string;
  titel: string;
  quest: string;
  teil: string;
  art: string;
  chars: number;
  wahlen: number;
};

export function pruefeWelt(): RegelFund[] {
  const fund: RegelFund[] = [];
  const ids = new Set<string>();

  for (const quest of QUESTS) {
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) {
        ids.add(szene.id);
        const mass = zeilenMass(szene.lines ?? []);
        if (mass.leer) {
          fund.push({ art: "fehler", id: szene.id, titel: szene.title, text: "Seite ohne Text." });
        } else if (mass.kurz) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: `Text zu kurz (${mass.chars} Zeichen).` });
        }
        if (mass.stichpunkt) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: "Stichpunkt in den Zeilen." });
        }
        if (!(szene.art in ART)) {
          fund.push({ art: "fehler", id: szene.id, titel: szene.title, text: `Bildschlüssel fehlt: ${szene.art}.` });
        }
        if (szene.portrait && !(szene.portrait in PORTRAITS)) {
          fund.push({ art: "fehler", id: szene.id, titel: szene.title, text: `Porträt fehlt: ${szene.portrait}.` });
        }
        const sprecher = sprecherAusZeilen(szene.lines ?? []);
        if (sprecher && !szene.portrait) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: `${sprecher} spricht, die Seite hat kein Porträt.` });
        }
        if (!szene.choices.length) {
          fund.push({ art: "warnung", id: szene.id, titel: szene.title, text: "Keine Wahl." });
        }
      }
    }
  }

  const flussIds = new Set(FLUSS.map((k) => k.id));
  for (const knoten of FLUSS) {
    for (const kante of knoten.weiter) {
      if (!flussIds.has(kante.id) && !ids.has(kante.id)) {
        fund.push({ art: "fehler", id: knoten.id, titel: knoten.titel, text: `Kante nach unbekannt: ${kante.id}.` });
      }
    }
  }

  const gegebenOrt = new Set<EffektId>();
  for (const ort of Object.values(ORT_ZUSTAENDE)) {
    for (const id of ort.hinzu) gegebenOrt.add(id);
  }
  const gegebenLage = new Set<EffektId>();
  for (const frage of HERKUNFT_FRAGEN) {
    for (const antwort of frage.antworten) {
      for (const id of antwort.effekte ?? []) gegebenLage.add(id);
    }
  }
  for (const id of EFFEKT_IDS) {
    if (gegebenOrt.has(id)) continue;
    if (gegebenLage.has(id)) {
      fund.push({ art: "info", text: `Zustand ${id} kommt aus einer Lage, von keinem Ort.` });
      continue;
    }
    fund.push({ art: "info", text: `Zustand ${id} wird nirgends vergeben — weder Ort noch Lage.` });
  }

  return fund;
}

export function bibliothek(): BibliothekZeile[] {
  const zeilen: BibliothekZeile[] = [];
  for (const quest of QUESTS) {
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) {
        zeilen.push({
          id: szene.id,
          titel: szene.title,
          quest: quest.titel,
          teil: teil.titel,
          art: szene.art,
          chars: zeilenMass(szene.lines ?? []).chars,
          wahlen: szene.choices.length,
        });
      }
    }
  }
  return zeilen;
}
