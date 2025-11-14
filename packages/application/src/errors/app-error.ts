import type { IEventBus } from "@ports";
import { AbstractError } from "@ynab-plus/bootstrap";

export class AppError extends AbstractError {
  public handle(events: IEventBus) {
    events.emit("ApplicationError", {
      stack: this.parsedStack,
      message: this.message,
    });
  }
}
