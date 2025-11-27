import type { ServiceIdentifier } from "inversify";

export interface ISessionIdRequester {
  getSessionId(): Promise<string>;
}

export const SessionIdRequsterToken: ServiceIdentifier<ISessionIdRequester> =
  Symbol.for("SessionIdRequester");
