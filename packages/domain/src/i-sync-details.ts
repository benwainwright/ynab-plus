import z from "zod";

export type ISyncDetials = z.output<typeof syncDetailsSchema>;

export const syncDetailsSchema = z.object({
  provider: z.string(),
  checkpoint: z.string(),
  lastUpdated: z.date(),
});
