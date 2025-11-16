import { AbstractError } from "@ynab-plus/bootstrap";
import type { Events } from "@ynab-plus/domain";

interface IEventEmitter {
  emit<TKey extends keyof Events>(key: TKey, data: Events[TKey]): void;
}

export class WebAppError extends AbstractError {
  public override handle(events: IEventEmitter) {
    events.emit("ApplicationError", {
      stack: this.parsedStack,
      message: this.message,
    });
  }
}
