import type { ILogger } from "@ynab-plus/bootstrap";
import type {
  IObjectStorage,
  ISessionIdRequester,
  ISingleItemStore,
  IUUIDGenerator,
} from "./ports/index.ts";

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
    return (await this.storage.get(`${sessionId}-session-key`)) as T;
  }

  async set(thing: T): Promise<void> {
    const sessionId = await this.sessionIdRequester.getSessionId();
    return await this.storage.set(`${sessionId}-session-key`, thing);
  }
}
