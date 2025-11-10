export interface ISessionIdRequester {
  getSessionId(): Promise<string | undefined>;
  setSessionId(id: string): Promise<void>;
}
