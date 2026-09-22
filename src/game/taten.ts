import { protokolliere } from "./decisions";
import { erinnertSich, merkeDir } from "./memory";
import { aendereRuf } from "./reputation";
import type { Held, Loesungsweg } from "./types";

const TATEN: Array<{ an: (held: Held) => boolean; npc: string; flag: string; ruf: number }> = [
  { an: (h) => h.maraGeholfen, npc: "mara", flag: "geholfen", ruf: 8 },
  { an: (h) => h.maraAbgewiesen, npc: "mara", flag: "abgewiesen", ruf: -6 },
  { an: (h) => h.auftragErhalten, npc: "holm", flag: "auftrag", ruf: 10 },
  { an: (h) => h.buergermeisterVertraut, npc: "holm", flag: "vertraut", ruf: 12 },
  { an: (h) => h.kernGeholfen, npc: "kern", flag: "geholfen", ruf: 8 },
  { an: (h) => h.kernAbgewiesen, npc: "kern", flag: "abgewiesen", ruf: -4 },
  { an: (h) => h.schmiedGeholfen, npc: "schmied", flag: "geholfen", ruf: 8 },
  { an: (h) => h.bettlerGeholfen, npc: "bettler", flag: "geholfen", ruf: 6 },
  { an: (h) => h.bettlerAbgewiesen, npc: "bettler", flag: "abgewiesen", ruf: -4 },
  { an: (h) => h.sannaGeholfen, npc: "sanna", flag: "geholfen", ruf: 8 },
  { an: (h) => h.sannaAbgewiesen, npc: "sanna", flag: "abgewiesen", ruf: -5 },
  { an: (h) => h.salzGerettet, npc: "jorren", flag: "salz", ruf: 6 },
  { an: (h) => h.glockeGestoppt, npc: "kess", flag: "glocke-still", ruf: -4 },
  { an: (h) => h.artefaktErhalten, npc: "fremder", flag: "artefakt", ruf: 0 },
  { an: (h) => h.loesungswegMuehle === "verhandelt", npc: "bertok", flag: "muehle-verhandelt", ruf: 8 },
  { an: (h) => h.loesungswegMuehle === "verraten", npc: "bertok", flag: "muehle-verraten", ruf: -12 },
  { an: (h) => h.loesungswegMuehle === "kampf", npc: "rennik", flag: "muehle-kampf", ruf: -8 },
  { an: (h) => h.loesungswegMuehle === "schleich", npc: "bertok", flag: "muehle-schleich", ruf: 4 },
  { an: (h) => h.loesungswegBrunnen === "geoeffnet", npc: "grovin", flag: "brunnen-offen", ruf: -6 },
  { an: (h) => h.loesungswegBrunnen === "zerstoert", npc: "grovin", flag: "brunnen-zerstoert", ruf: -10 },
  { an: (h) => h.loesungswegBrunnen === "verhandelt", npc: "kern", flag: "brunnen-verhandelt", ruf: 6 },
  { an: (h) => h.loesungswegBrunnen === "bestochen", npc: "dennek", flag: "brunnen-bestochen", ruf: -8 },
  { an: (h) => h.loesungswegGasse === "veroeffentlicht", npc: "vahl", flag: "gasse-liste", ruf: -10 },
  { an: (h) => h.loesungswegGasse === "vernichtet", npc: "grete", flag: "gasse-asche", ruf: -8 },
  { an: (h) => h.loesungswegGasse === "weitergegeben", npc: "holm", flag: "gasse-holm", ruf: 4 },
  { an: (h) => h.loesungswegGasse === "erpresst", npc: "vahl", flag: "gasse-erpresst", ruf: -6 },
  { an: (h) => h.ungerufenerNameGeloest === "anvertraut", npc: "koehler", flag: "name-anvertraut", ruf: 6 },
  { an: (h) => h.ungerufenerNameGeloest === "erzwungen", npc: "koehler", flag: "name-erzwungen", ruf: -4 },
  { an: (h) => h.ungerufenerNameGeloest === "gefolgt", npc: "koehler", flag: "name-gefolgt", ruf: 0 },
];

export function synchronisiereLog(held: Held, szeneId: string): void {
  if (!held.entscheidungen) held.entscheidungen = [];
  for (const tat of TATEN) {
    if (!tat.an(held)) continue;
    if (erinnertSich(held, tat.npc, tat.flag)) continue;
    merkeDir(held, szeneId, tat.npc, tat.flag);
    aendereRuf(held, szeneId, tat.npc, tat.ruf);
  }
  if (held.loesungsweg && !(held.entscheidungen ?? []).some((e) => e.typ === "weg" && e.ziel === "lager")) {
    protokolliere(held, { szeneId, typ: "weg", ziel: "lager", wert: held.loesungsweg });
    const kess =
      held.loesungsweg === "kampf" ? -20 : held.loesungsweg === "ueberreden" ? 6 : held.loesungsweg === "banditen_geholfen" ? 12 : 0;
    aendereRuf(held, szeneId, "kess", kess);
  }
}

export function schliesseLager(held: Held, weg: Exclude<Loesungsweg, null>, beute: boolean, szeneId: string): void {
  held.loesungsweg = weg;
  held.lagerGeloest = true;
  held.beuteGerettet = beute;
  synchronisiereLog(held, szeneId);
}
