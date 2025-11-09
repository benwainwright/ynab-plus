import type { IEventBus, Permission } from "@types";
import { AppError } from "./app-error.ts";

export class NotAuthorisedError extends AppError {
  public constructor(
    message: string,
    private handler: string,
    private userId: string | undefined,
    private actualPermissions: Permission[],
    private requiredPermissions: Permission[],
  ) {
    super(message);
  }

  public override handle(events: IEventBus) {
    events.emit("NotAuthorisedError", {
      handler: this.handler,
      userId: this.userId,
      userPermissions: this.actualPermissions,
      requiredPermissions: this.requiredPermissions,
    });
  }
}
