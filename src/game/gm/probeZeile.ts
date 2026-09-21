import type { ProbeResult } from "../types";

function kurz(name: string): "ST" | "GE" | "CH" {
  const n = name.toLowerCase();
  if (n.startsWith("stär") || n === "st" || n === "staerke") return "ST";
  if (n.startsWith("gesch") || n === "ge") return "GE";
  return "CH";
}

export function probeZeile(p: ProbeResult): string {
  return `W10 ${p.wurf} + ${kurz(p.attributName)} ${p.attributWert} + Mod ${p.mod} + Nebel ${p.nebel} = ${p.summe} gegen ${p.schwierigkeit} — ${p.erfolg ? "Erfolg" : "Fehlschlag"}`;
}
