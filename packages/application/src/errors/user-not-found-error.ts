import { AppError } from "./app-error.ts";

export class UserNotFoundError extends AppError {
  public constructor(
    message: string,
    private userId: string,
  ) {
    super(message);
  }
}
