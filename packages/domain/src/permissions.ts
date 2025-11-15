import z from "zod";

export const permissions = ["public", "user", "admin"] as const;

export const permissionSchema = z
  .union([z.literal("public"), z.literal("user"), z.literal("admin")])
  .readonly();

export type Permission = z.output<typeof permissionSchema>;
