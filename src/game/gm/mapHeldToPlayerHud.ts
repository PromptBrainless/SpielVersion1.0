import { EFFEKTE, heldEffekte, werteMitEffekt } from "../effekte";
import { knowledgeLabels } from "../knowledge";
import { MAX_LP, type Held } from "../types";
import { leseSpieltag, leseTageszeit } from "../tageszeit";
import type { PlayerHudState } from "./GmToolTypes";

export function mapHeldToPlayerHud(held: Held): PlayerHudState {
  const werte = werteMitEffekt(held);
  const gunst: string[] = [];
  const last: string[] = [];
  for (const id of heldEffekte(held)) {
    const item = EFFEKTE[id];
    if (item.gruppe === "gunst") gunst.push(item.name);
    else last.push(item.name);
  }
  return {
    name: held.name,
    lp: held.lp,
    maxLp: MAX_LP,
    st: werte.staerke,
    ge: werte.geschick,
    ch: werte.charisma,
    stBasis: held.staerke,
    geBasis: held.geschick,
    chBasis: held.charisma,
    gold: held.gold,
    inventar: [...held.inventar],
    gunst,
    last,
    mal: held.mal,
    tageszeit: leseTageszeit(held),
    spieltag: leseSpieltag(held),
    lebend: held.lebend,
    wissen: knowledgeLabels(held).sicher,
  };
}
