import type { IEventBus } from "@ports";
import type {
  Commands,
  Permission,
  SystemContext,
  User,
} from "@ynab-plus/domain";

import { AppError } from "./app-error.ts";

export class NotAuthorisedError extends AppError {
  public constructor(
    message: string,
    public readonly handler: keyof Commands,
    public readonly role: User | SystemContext | undefined,
    public readonly requiredPermissions: Permission[],
  ) {
    super(message);
  }

  public override handle(events: IEventBus) {
    events.emit("NotAuthorisedError", {
      handler: this.handler,
      role: this.role,
      requiredPermissions: this.requiredPermissions,
    });
  }
}
