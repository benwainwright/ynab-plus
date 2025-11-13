import type { ISessionIdRequester } from "@ynab-plus/app";
import type { ILogger } from "@ynab-plus/bootstrap";
import { v7 } from "uuid";
import cookie from "cookie";
import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { WebAppError } from "./web-app-error.ts";

export const SESSION_ID_COOKIE_KEY = `ynab-plus-session-id`;

export const LOG_CONTEXT = { context: "session-id-handler" };

export class SessionIdHandler {
  public constructor(private logger: ILogger) {}

  private sessionIds = new WeakMap<IncomingMessage, string>();

  public setSesionId(headers: string[], request: IncomingMessage) {
    const existingId = this.parseSessionIdFromRequest(request);

    const newId = v7();

    if (!existingId) {
      headers.push(`Set-Cookie: ${SESSION_ID_COOKIE_KEY}=${newId}`);
    }

    this.sessionIds.set(request, newId);
  }

  private parseSessionIdFromRequest(
    request: IncomingMessage,
  ): string | undefined {
    if (request) {
      const cookies = cookie.parse(request.headers.cookie ?? "");
      const key = cookies[SESSION_ID_COOKIE_KEY];
      this.logger.silly(`Found session id in cookies: ${key}`, LOG_CONTEXT);
    } else {
      this.logger.silly(`No session id found in cookies`, LOG_CONTEXT);
    }
    return undefined;
  }

  public getSessionId(request: IncomingMessage): string {
    const id = this.sessionIds.get(request);
    if (!id) {
      throw new WebAppError(`No id was found`);
    }
    return id;
  }
}
