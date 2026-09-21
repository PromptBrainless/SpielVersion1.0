import { useSyncExternalStore } from "react";
import {
  EINSTELLUNGEN_STANDARD,
  abonniere,
  leseEinstellungen,
  type Einstellungen,
} from "./einstellungen";

/** Liest die Systemsteuerung reaktiv. Serverseitig gelten die Standardwerte. */
export function useEinstellungen(): Einstellungen {
  return useSyncExternalStore(abonniere, leseEinstellungen, () => EINSTELLUNGEN_STANDARD);
}
