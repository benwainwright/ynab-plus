import z from "zod";

export const oAuthTokenSchema = z.object({
  expiry: z.date(),
  token: z.string(),
  refreshToken: z.string(),
  provider: z.string(),
  userId: z.string(),
  lastUse: z.union([z.date(), z.undefined()]),
  refreshed: z.union([z.date(), z.undefined()]),
  created: z.date(),
});

export type IOauthToken = z.output<typeof oAuthTokenSchema>;
