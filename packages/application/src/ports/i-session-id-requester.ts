export interface ISessionIdRequester {
  getSessionId(): Promise<string>;
}
