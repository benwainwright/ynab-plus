export interface ISessionRequester {
  getSessionId(): string;
  setSessionId(id: string): void;
}
