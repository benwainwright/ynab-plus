import type { BunRequest } from "bun";

const SESSION_COOKIE_NAME = "ynab-plus-session-id";

interface Storage {
  get(key: string): Promise<object | undefined>;
  set(key: string, thing: object): Promise<void>;
}

export class SessionStorage<T extends object> {
  public constructor(
    private key: string,
    private request: BunRequest,
    private storage: Storage,
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
    return (await this.storage.get(`${sessionId}-${this.key}`)) as T;
  }

  async set(thing: T): Promise<void> {
    const sessionId = this.getSessionId();
    return await this.storage.set(`${sessionId}-${this.key}`, thing);
  }
}
