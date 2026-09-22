import { z } from "zod";
import { StimmeZugSchema } from "./wissen-schema";

export const StimmeSyncSchema = z.object({
  id: z.string().min(1),
  stimmen: z.array(z.union([z.string(), StimmeZugSchema])),
});

export type StimmeSyncJson = z.infer<typeof StimmeSyncSchema>;
