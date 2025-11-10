import type { Permission } from "@domain";
import { AppError } from "./app-error.ts";
import type { IEventBus } from "@application";

export class NotAuthorisedError extends AppError {
  public constructor(
    message: string,
    public readonly handler: keyof Commands,
    public readonly userId: string | undefined,
    public readonly actualPermissions: Permission[],
    public readonly requiredPermissions: Permission[],
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
