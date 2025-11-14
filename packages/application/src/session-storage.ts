import type {
  IObjectStorage,
  ISessionIdRequester,
  ISingleItemStore,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

export const LOG_CONTEXT = { context: "session-storage" };

export class SessionStorage<T extends object | undefined>
  implements ISingleItemStore<T>
{
  public constructor(
    private storage: IObjectStorage,
    private sessionIdRequester: ISessionIdRequester,
    private logger: ILogger,
  ) {}

  public async get(): Promise<T> {
    const sessionId = await this.sessionIdRequester.getSessionId();
    const sessionData = (await this.storage.get(
      `${sessionId}-session-key`,
    )) as T;
    this.logger.silly(
      `Received session data: ${JSON.stringify(sessionData)}`,
      LOG_CONTEXT,
    );
    return sessionData;
  }

  async set(thing: T): Promise<void> {
    const sessionId = await this.sessionIdRequester.getSessionId();

    this.logger.silly(
      `Saving session data: ${JSON.stringify(thing)}`,
      LOG_CONTEXT,
    );
    return await this.storage.set(`${sessionId}-session-key`, thing ?? {});
  }
}
