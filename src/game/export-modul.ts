import type { ZodTypeAny } from "zod";

export function exportiereModul(
  dateiname: string,
  schema: ZodTypeAny,
  daten: unknown,
): { dateiname: string; inhalt: string } {
  schema.parse(daten);
  return { dateiname, inhalt: JSON.stringify(daten, null, 2) };
}

export function importiereModul<T>(schema: ZodTypeAny, roh: string): T {
  let daten: unknown;
  try {
    daten = JSON.parse(roh);
  } catch {
    throw new Error("Kein JSON.");
  }
  return schema.parse(daten) as T;
}
