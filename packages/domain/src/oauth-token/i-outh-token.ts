import z from "zod";

export const oAuthTokenSchema = z.object({
  expiry: z.union([
    z
      .union([z.string(), z.date()])
      .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg)),
    z.undefined()
  ]),
  token: z.string(),
  refreshToken: z.string(),
  provider: z.string(),
  userId: z.string(),
  refreshExpiry: z.union([
    z
      .union([z.string(), z.date()])
      .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg)),
    z.undefined()
  ]),
  lastUse: z.union([
    z
      .union([z.string(), z.date()])
      .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg)),
    z.undefined()
  ]),
  refreshed: z.union([
    z
      .union([z.string(), z.date()])
      .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg)),
    z.undefined()
  ]),
  created: z
    .union([z.string(), z.date()])
    .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg))
});

export type IOauthToken = z.output<typeof oAuthTokenSchema>;
