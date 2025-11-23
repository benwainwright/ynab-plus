import { DomainError } from "./domain-error.ts";

interface IEventEmitter {
  emit(key: unknown, data: unknown): void;
}

export class TokenExpiredError extends DomainError {
  public constructor(
    message: string,
    private provider: string,
  ) {
    super(message);
  }

  public handle(events: IEventEmitter): void {
    events.emit("TokenExpiredError", {
      provider: this.provider,
    });
  }
}
