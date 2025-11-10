import { AppError } from "./app-error.ts";

export class ServiceNotFoundError extends AppError {
  public constructor(parsedMessage: unknown) {
    const message =
      parsedMessage &&
      typeof parsedMessage === "object" &&
      "key" in parsedMessage
        ? `Handler for ${parsedMessage.key} not found`
        : `Handler not found`;

    super(message);
  }
}
