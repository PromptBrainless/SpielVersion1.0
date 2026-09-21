import { HeldPartialSchema, leseEntscheidungen } from "./heldSchema";
import { createHeld, type Held } from "./types";

const SAVE_KEY = "lindendorf-save-v1";
const SLOTS_KEY = "lindendorf-saves-v2";
const LAST_NAME_KEY = "lindendorf-save-last-name";

export type SavePayload = {
  version: 1;
  savedAt: string;
  held: Held;
};

export type SaveSlotInfo = {
  name: string;
  nameKey: string;
  savedAt: string;
  lp: number;
};

type SlotMap = Record<string, SavePayload>;

function isHeld(value: unknown): value is Held {
  if (!HeldPartialSchema.safeParse(value).success) return false;
  const held = value as Partial<Held>;
  return Array.isArray(held.inventar) && typeof held.gold === "number" && typeof held.lebend === "boolean";
}

export function normalizeHeldName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function nameKey(name: string): string {
  return normalizeHeldName(name).toLocaleLowerCase("de-DE");
}

function hydrateHeld(held: Held): Held {
  const defaults = createHeld(held.name, held.staerke, held.geschick, held.charisma);
  return {
    ...defaults,
    ...held,
    inventar: [...held.inventar],
    effekte: [...(held.effekte ?? [])],
    mal: held.mal ?? "",
    entscheidungen: leseEntscheidungen(held),
  };
}

function parsePayload(raw: string | null): SavePayload | null {
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as Partial<SavePayload>;
    if (payload.version !== 1 || !isHeld(payload.held)) return null;
    return {
      version: 1,
      savedAt: typeof payload.savedAt === "string" ? payload.savedAt : new Date().toISOString(),
      held: hydrateHeld(payload.held),
    };
  } catch {
    return null;
  }
}

function readSlots(): SlotMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SLOTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SlotMap;
    if (!parsed || typeof parsed !== "object") return {};
    const slots: SlotMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value?.version === 1 && isHeld(value.held)) {
        slots[key] = {
          version: 1,
          savedAt: value.savedAt,
          held: hydrateHeld(value.held),
        };
      }
    }
    return slots;
  } catch {
    return {};
  }
}

function writeSlots(slots: SlotMap): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
    return true;
  } catch {
    return false;
  }
}

function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;
  const slots = readSlots();
  if (Object.keys(slots).length > 0) return;
  const legacy = parsePayload(window.localStorage.getItem(SAVE_KEY));
  if (!legacy) return;
  const key = nameKey(legacy.held.name);
  slots[key] = legacy;
  writeSlots(slots);
  window.localStorage.setItem(LAST_NAME_KEY, normalizeHeldName(legacy.held.name));
}

export function listSavedGames(): SaveSlotInfo[] {
  if (typeof window === "undefined") return [];
  migrateLegacyIfNeeded();
  return Object.entries(readSlots())
    .map(([key, payload]) => ({
      name: payload.held.name,
      nameKey: key,
      savedAt: payload.savedAt,
      lp: payload.held.lp,
    }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function hasSavedGame(): boolean {
  if (typeof window === "undefined") return false;
  migrateLegacyIfNeeded();
  return listSavedGames().length > 0 || window.localStorage.getItem(SAVE_KEY) !== null;
}

export function hasSavedGameForName(name: string): boolean {
  return loadGameByName(name) !== null;
}

export function saveGame(held: Held): boolean {
  if (typeof window === "undefined") return false;
  const name = normalizeHeldName(held.name) || "Namenlos";
  const payload: SavePayload = {
    version: 1,
    savedAt: new Date().toISOString(),
    held: { ...held, name },
  };
  const slots = readSlots();
  slots[nameKey(name)] = payload;
  const ok = writeSlots(slots);
  if (!ok) return false;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    window.localStorage.setItem(LAST_NAME_KEY, name);
    return true;
  } catch {
    return true;
  }
}

export function loadGame(): Held | null {
  if (typeof window === "undefined") return null;
  migrateLegacyIfNeeded();
  const last = window.localStorage.getItem(LAST_NAME_KEY);
  if (last) {
    const named = loadGameByName(last);
    if (named) return named;
  }
  const slots = listSavedGames();
  if (slots[0]) return loadGameByName(slots[0].name);
  const legacy = parsePayload(window.localStorage.getItem(SAVE_KEY));
  return legacy?.held ?? null;
}

export function loadGameByName(name: string): Held | null {
  if (typeof window === "undefined") return null;
  migrateLegacyIfNeeded();
  const key = nameKey(name);
  if (!key) return null;
  const slots = readSlots();
  const slot = slots[key];
  if (slot) {
    window.localStorage.setItem(LAST_NAME_KEY, normalizeHeldName(slot.held.name));
    return slot.held;
  }
  const legacy = parsePayload(window.localStorage.getItem(SAVE_KEY));
  if (legacy && nameKey(legacy.held.name) === key) return legacy.held;
  return null;
}

export function peekSaveForName(name: string): SaveSlotInfo | null {
  const held = loadGameByName(name);
  if (!held) return null;
  const slots = readSlots();
  const slot = slots[nameKey(name)];
  return {
    name: held.name,
    nameKey: nameKey(held.name),
    savedAt: slot?.savedAt ?? "",
    lp: held.lp,
  };
}

export function exportiereSpielstand(held: Held): string {
  const name = normalizeHeldName(held.name) || "Namenlos";
  const payload: SavePayload = {
    version: 1,
    savedAt: new Date().toISOString(),
    held: { ...held, name },
  };
  return JSON.stringify(payload, null, 2);
}

export function importiereSpielstand(roh: string): Held | null {
  const payload = parsePayload(roh);
  if (!payload) return null;
  saveGame(payload.held);
  return payload.held;
}

export function ladeSpielstandDatei(name: string, inhalt: string) {
  const blob = new Blob([inhalt], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lindendorf-${nameKey(name) || "stand"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function clearSavedGame(): void {
  if (typeof window === "undefined") return;
  const last = window.localStorage.getItem(LAST_NAME_KEY);
  if (last) {
    const slots = readSlots();
    delete slots[nameKey(last)];
    writeSlots(slots);
  }
  window.localStorage.removeItem(SAVE_KEY);
  window.localStorage.removeItem(LAST_NAME_KEY);
}

export function clearSavedGameForName(name: string): void {
  if (typeof window === "undefined") return;
  const slots = readSlots();
  delete slots[nameKey(name)];
  writeSlots(slots);
  const last = window.localStorage.getItem(LAST_NAME_KEY);
  if (last && nameKey(last) === nameKey(name)) {
    window.localStorage.removeItem(LAST_NAME_KEY);
    window.localStorage.removeItem(SAVE_KEY);
  }
}
