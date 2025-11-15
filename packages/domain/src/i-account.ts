import z from "zod";

export const accountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.string(),
  closed: z.boolean(),
  note: z.union([z.string(), z.undefined()]),
  deleted: z.boolean(),
});

export type IAccount = z.output<typeof accountSchema>;
