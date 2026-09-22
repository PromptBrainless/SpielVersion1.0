import { z } from "zod";

export const StimmeZugSchema = z.object({
  src: z.string().min(1),
  name: z.string().optional(),
});

export const WissenTafelSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  bild: z.string().min(1),
  offen: z.boolean().optional(),
  lines: z.array(z.string()).min(1),
  stimmeSrc: z.string().optional(),
  stimmen: z.array(z.union([z.string(), StimmeZugSchema])).optional(),
});

export type WissenTafelJson = z.infer<typeof WissenTafelSchema>;
