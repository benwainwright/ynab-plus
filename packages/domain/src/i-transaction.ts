import z from "zod";

export type ITransaction = z.output<typeof transactionSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  date: z.string().transform((date) => new Date(date)),
  amount: z.number(),
  cleared: z.boolean(),
  memo: z.string().optional(),
  approved: z.boolean(),
});
