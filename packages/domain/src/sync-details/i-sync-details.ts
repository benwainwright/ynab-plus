import z from "zod";

export type ISyncDetails = z.output<typeof syncDetailsSchema>;

export const syncDetailsSchema = z.object({
  id: z.string(),
  provider: z.string(),
  checkpoint: z.string().optional(),
  lastSync: z
    .union([z.date(), z.string()])
    .optional()
    .transform((date) => (typeof date !== "undefined" ? new Date(date) : date))
});
