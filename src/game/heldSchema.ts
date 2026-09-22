import { z } from "zod";

export const EntscheidungSchema = z.object({
  szeneId: z.string(),
  timestamp: z.number(),
  typ: z.enum(["ruf", "wissen", "npc", "weg"]),
  ziel: z.string(),
  wert: z.union([z.number(), z.string(), z.boolean()]),
});

export type Entscheidung = z.infer<typeof EntscheidungSchema>;

export const HeldPartialSchema = z.object({
  name: z.string(),
  staerke: z.number(),
  geschick: z.number(),
  charisma: z.number(),
  lp: z.number(),
  entscheidungen: z.array(EntscheidungSchema).default([]),
});

export function validiereHeldStreng(value: unknown): boolean {
  return HeldPartialSchema.safeParse(value).success;
}

export function leseEntscheidungen(value: unknown): Entscheidung[] {
  if (!value || typeof value !== "object") return [];
  const raw = (value as { entscheidungen?: unknown }).entscheidungen;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const parsed = EntscheidungSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export const SAVE_VERSION = 2;

export const SaveHeldSchema = HeldPartialSchema.extend({
  inventar: z.array(z.string()),
  gold: z.number(),
  lebend: z.boolean(),
}).passthrough();

export const SavePayloadSchema = z.object({
  version: z.number().int().min(1).max(SAVE_VERSION),
  savedAt: z.string().optional(),
  held: SaveHeldSchema,
});

