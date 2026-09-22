import { attributKurz, attributName } from "../attribute";
import type { ProbeResult } from "../types";

export function probeZeile(p: ProbeResult): string {
  const kurz = attributKurz(p.attributName);
  const lang = attributName(p.attributName);
  return `W10 ${p.wurf} + ${lang} ${kurz} ${p.attributWert} + Zeit ${p.mod} + Nebel ${p.nebel} = ${p.summe} gegen ${p.schwierigkeit} — ${p.erfolg ? "Erfolg" : "Fehlschlag"}`;
}
