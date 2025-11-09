import type { Permission } from "@types";

export class NotAuthorisedError extends Error {
  public constructor(
    message: string,
    private userId: string | undefined,
    private requiredPermissions: Permission[],
  ) {
    super(message);
  }
}
