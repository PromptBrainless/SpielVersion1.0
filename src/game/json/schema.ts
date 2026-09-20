import { z } from "zod";

export const SzeneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  art: z.string().min(1),
  portrait: z.string().nullable().optional(),
  lines: z.array(z.string()),
  choices: z.array(z.string()),
  successLines: z.array(z.string()).optional(),
  failureLines: z.array(z.string()).optional(),
  passLines: z.array(z.string()).optional(),
});

export const TeilSchema = z.object({
  id: z.string().min(1),
  titel: z.string().min(1),
  quest: z.string().min(1),
  datei: z.string().min(1),
  szenen: z.array(SzeneSchema).min(1),
});

export const QuestSchema = z.object({
  id: z.string().min(1),
  titel: z.string().min(1),
  reihe: z.string().min(1),
  datei: z.string().min(1),
  teile: z.array(TeilSchema).min(1),
});

export type SzeneJson = z.infer<typeof SzeneSchema>;
export type TeilJson = z.infer<typeof TeilSchema>;
export type QuestJson = z.infer<typeof QuestSchema>;

export function karte(
  id: string,
  title: string,
  art: string,
  lines: string[] = [],
  choices: string[] = ["Weiter"],
  portrait: string | null = null,
): SzeneJson {
  return { id, title, art, portrait, lines, choices };
}
