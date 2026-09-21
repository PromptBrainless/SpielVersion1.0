import { setzeEffekt } from "../effekte";
import { cloneHeld, type Held } from "../types";
import { setzeTageszeit } from "../tageszeit";
import type { GmCommand, GmCommandVorschau } from "./GmToolTypes";

export function vorschauGmCommand(cmd: GmCommand): GmCommandVorschau {
  if (cmd.art === "effekt") {
    return {
      art: "effekt",
      satz: cmd.an ? `legt ${cmd.id}` : `nimmt ${cmd.id}`,
      trifft: "held",
    };
  }
  if (cmd.art === "tageszeit") {
    return { art: "tageszeit", satz: `Zeit wird ${cmd.zeit}`, trifft: "held" };
  }
  if (cmd.art === "auflage") {
    return { art: "auflage", satz: `Auflage auf ${cmd.schluessel}`, trifft: "auflage" };
  }
  if (cmd.art === "lage") {
    return { art: "lage", satz: `Lage ${cmd.frageIndex + 1} vorlegen`, trifft: "held" };
  }
  return {
    art: "probe",
    satz: `Probe ${cmd.attribut} gegen ${cmd.schwelle}${cmd.nebel ? ", Nebel" : ""} — schreibt nicht`,
    trifft: "probe",
  };
}

export function wendeGmCommandAn(held: Held, cmd: GmCommand): Held {
  if (cmd.art === "probe" || cmd.art === "auflage") return held;
  const next = cloneHeld(held);
  if (cmd.art === "effekt") {
    setzeEffekt(next, cmd.id, cmd.an);
    return next;
  }
  if (cmd.art === "tageszeit") {
    setzeTageszeit(next, cmd.zeit);
    return next;
  }
  return next;
}
