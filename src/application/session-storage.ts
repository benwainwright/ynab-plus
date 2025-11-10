import type {
  IObjectStorage,
  ISessionIdRequester,
  ISingleItemStore,
} from "./ports/index.ts";

export class SessionStorage<T extends object | undefined>
  implements ISingleItemStore<T>
{
  public constructor(
    private storage: IObjectStorage,
    private sessionIdRequester: ISessionIdRequester,
  ) {}

  public async getSessionId() {
    const sessionId = await this.sessionIdRequester.getSessionId();

    if (sessionId) {
      return sessionId;
    }

    const newId = Bun.randomUUIDv7();
    await this.sessionIdRequester.setSessionId(newId);

    return newId;
  }

  public async get(): Promise<T> {
    const sessionId = await this.getSessionId();
    return (await this.storage.get(`${sessionId}-session-key`)) as T;
  }

  async set(thing: T): Promise<void> {
    const sessionId = await this.getSessionId();
    return await this.storage.set(`${sessionId}-session-key`, thing);
  }
}
