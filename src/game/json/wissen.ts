import { WissenTafelSchema, type WissenTafelJson } from "./wissen-schema";

function ladeRoh(): Record<string, unknown> {
  try {
    return import.meta.glob("./wissen/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const WISSEN_DATEIEN: Record<string, WissenTafelJson> = {};

for (const [pfad, wert] of Object.entries(ladeRoh())) {
  const gelesen = WissenTafelSchema.safeParse(wert);
  if (!gelesen.success) continue;
  const id = gelesen.data.id || pfad.replace(/^.*\//, "").replace(/\.json$/, "");
  WISSEN_DATEIEN[id] = gelesen.data;
}

export function wissenDatei(id: string): WissenTafelJson | null {
  return WISSEN_DATEIEN[id] ?? null;
}

export function merkeWissenDatei(tafel: WissenTafelJson) {
  WISSEN_DATEIEN[tafel.id] = tafel;
}

export function loescheWissenDatei(id: string) {
  delete WISSEN_DATEIEN[id];
}

export function wissenIds(): string[] {
  return Object.keys(WISSEN_DATEIEN).sort((a, b) => a.localeCompare(b, "de"));
}
