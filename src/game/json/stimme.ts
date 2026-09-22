import { alsZuege, type StimmeZug } from "../stimme";
import { StimmeSyncSchema, type StimmeSyncJson } from "./stimme-schema";

function ladeRoh(): Record<string, unknown> {
  try {
    return import.meta.glob("./stimme/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const STIMME_DATEIEN: Record<string, StimmeSyncJson> = {};

for (const [pfad, wert] of Object.entries(ladeRoh())) {
  const gelesen = StimmeSyncSchema.safeParse(wert);
  if (!gelesen.success) continue;
  const id = gelesen.data.id || pfad.replace(/^.*\//, "").replace(/\.json$/, "");
  STIMME_DATEIEN[id] = gelesen.data;
}

export function stimmeDatei(id: string | undefined): StimmeZug[] {
  if (!id) return [];
  const datei = STIMME_DATEIEN[id];
  if (!datei) return [];
  return alsZuege(undefined, datei.stimmen);
}

export function merkeStimmeDatei(id: string, stimmen: StimmeZug[]) {
  STIMME_DATEIEN[id] = { id, stimmen };
}
