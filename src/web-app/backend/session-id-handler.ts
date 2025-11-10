import type { ISessionIdRequester } from "@application";
import type { BunRequest } from "bun";

export const SESSION_ID_COOKIE_KEY = `ynab-plus-session-id`;

export class SessionIdHandler implements ISessionIdRequester {
  public constructor(private request: BunRequest) {}
  async getSessionId(): Promise<string | undefined> {
    return this.request.cookies.get(SESSION_ID_COOKIE_KEY) ?? undefined;
  }
  async setSessionId(id: string): Promise<void> {
    this.request.cookies.set(SESSION_ID_COOKIE_KEY, id);
  }
}
