export const permissions = ["public", "user", "admin"] as const;

export type Permission = (typeof permissions)[number];
