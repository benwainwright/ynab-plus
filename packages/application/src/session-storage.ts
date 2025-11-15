import { AppError } from "@errors";
import type {
  IObjectStorage,
  ISessionIdRequester,
  ISingleItemStore,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

export const LOG_CONTEXT = { context: "session-storage" };

export class SessionStorage<T extends object> implements ISingleItemStore<T> {
  public constructor(
    private storage: IObjectStorage<T>,
    private sessionIdRequester: ISessionIdRequester,
    private logger: ILogger,
  ) {}

  public async require(): Promise<T> {
    const item = await this.get();

    if (!item) {
      throw new AppError(
        `Session data required but was not found. This method should not be called when the user is logged out`,
      );
    }

    return item;
  }

  public async get(): Promise<T | undefined> {
    const sessionId = await this.sessionIdRequester.getSessionId();
    const key = `${sessionId}-session-key`;

    this.logger.silly(`Received session key: ${key}`, LOG_CONTEXT);
    const sessionData = (await this.storage.get(key)) as T;
    this.logger.silly(
      `Received session data: ${JSON.stringify(sessionData)}`,
      LOG_CONTEXT,
    );
    return sessionData;
  }

  async set(thing: T | undefined): Promise<void> {
    const sessionId = await this.sessionIdRequester.getSessionId();

    this.logger.silly(
      `Saving session data: ${JSON.stringify(thing)}`,
      LOG_CONTEXT,
    );
    await this.storage.set(`${sessionId}-session-key`, thing);
  }
}
