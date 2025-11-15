import z from "zod";

export const permissions = ["public", "user", "admin"] as const;

export const permissionSchema = z
  .union(permissions.map((permission) => z.literal(permission)))
  .readonly();

export type Permission = z.output<typeof permissionSchema>;
