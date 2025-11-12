import type { ISessionIdRequester } from "@ynab-plus/app";
import cookie from "cookie";
import { IncomingMessage } from "http";
import WebSocket from "ws";

export const SESSION_ID_COOKIE_KEY = `ynab-plus-session-id`;

export class SessionIdHandler implements ISessionIdRequester {
  public constructor(
    private server: WebSocket,
    private request: IncomingMessage,
  ) {}
  async getSessionId(): Promise<string | undefined> {
    if (this.request.headers.cookie) {
      const cookies = cookie.parse(this.request.headers.cookie);
      return cookies[SESSION_ID_COOKIE_KEY];
    }
    return undefined;
  }
  async setSessionId(id: string): Promise<void> {
    return await new Promise((accept) => {
      this.server.once("headers", (headers) => {
        headers.push(
          "Set-Cookie: " + cookie.serialize(SESSION_ID_COOKIE_KEY, id),
        );
        accept();
      });
    });
  }
}
