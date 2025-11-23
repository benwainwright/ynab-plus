import z from "zod";

export const bankConnectionSchema = z.object({
  bankName: z.string(),
  logo: z.string(),
  requisitionId: z.string().optional(),
  token: z.string().optional(),
  tokenExpiry: z.date().optional(),
  refreshToken: z.string().optional(),
  refreshTokenExpiry: z.date().optional(),
});

export type IBankConnection = z.output<typeof bankConnectionSchema>;
