import z from "zod";

export type ITransaction = z.output<typeof transactionSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  userId: z.string(),

  date: z
    .union([z.date(), z.string()])
    .transform((date) => (typeof date === "string" ? new Date(date) : date)),

  payee: z.string(),
  amount: z.number(),
  cleared: z.union([z.literal("cleared"), z.literal("uncleared"), z.literal("reconciled")]),
  memo: z.string().optional(),
  approved: z.boolean()
});
