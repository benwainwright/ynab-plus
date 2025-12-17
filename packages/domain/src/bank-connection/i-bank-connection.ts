import z from "zod";

export const bankConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bankName: z.string(),
  logo: z.string(),
  requisitionId: z.string().optional(),
  accounts: z.array(z.string()).optional()
});

export type IBankConnection = z.output<typeof bankConnectionSchema>;
