import type { IEventBus } from "@ynab-plus/app";
import { AbstractError } from "@ynab-plus/bootstrap";
import type { AdapterEvents } from "../adapter-events.ts";

export class HttpError extends AbstractError {
  public constructor(
    message: string,
    private statusCode: number,
    private body: string
  ) {
    super(message);
  }

  public override handle(events: IEventBus<AdapterEvents>): void {
    events.emit("HttpError", {
      statusCode: this.statusCode,
      body: this.body
    });
  }
}
