import { requestToken, sessionFileStorageToken } from "@tokens";
import type { ISessionStorage, ISimpleStorage } from "@types";
import type { BunRequest } from "bun";
import { inject, injectable } from "inversify";

const SESSION_COOKIE_NAME = "ynab-plus-session-id";

@injectable()
export class SessionStorage<T extends object> implements ISessionStorage<T> {
  public constructor(
    @inject(requestToken)
    private request: BunRequest,

    @inject(sessionFileStorageToken)
    private storage: ISimpleStorage,
  ) {}

  public getSessionId() {
    const sessionId = this.request.cookies.get(SESSION_COOKIE_NAME);

    if (sessionId) {
      return sessionId;
    }

    const newId = Bun.randomUUIDv7();
    this.request.cookies.set(SESSION_COOKIE_NAME, newId);

    return newId;
  }

  public async get(): Promise<T> {
    const sessionId = this.getSessionId();
    return (await this.storage.get(`${sessionId}-session-key`)) as T;
  }

  async set(thing: T): Promise<void> {
    const sessionId = this.getSessionId();
    return await this.storage.set(`${sessionId}-session-key`, thing);
  }
}
