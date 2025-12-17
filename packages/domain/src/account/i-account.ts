import z from "zod";

export const accountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.string(),
  closed: z.boolean(),
  balance: z.number(),
  clearedBalance: z.number(),
  unclearedBalance: z.number(),
  linkedOpenBankingAccount: z.string().optional(),
  note: z
    .union([z.string(), z.null()])
    .transform((item) => item ?? undefined)
    .optional(),

  deleted: z.boolean()
});

export type IAccount = z.output<typeof accountSchema>;
