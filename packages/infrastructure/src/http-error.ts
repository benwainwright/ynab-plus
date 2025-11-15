import type { IEventBus } from "@ynab-plus/app";
import { AbstractError } from "@ynab-plus/bootstrap";

export class HttpError extends AbstractError {
  public constructor(
    message: string,
    private statusCode: number,
    private body: string,
  ) {
    super(message);
  }

  public override handle(events: IEventBus): void {
    events.emit("HttpError", {
      statusCode: this.statusCode,
      body: this.body,
    });
  }
}
