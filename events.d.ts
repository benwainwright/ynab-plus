import { type ICommandResponse } from "@types";

declare global {
  interface Events {
    AppInitialised: { url: string; port: number };
    AppClosing: undefined;
    CommandResponse: ICommandResponse<keyof Commands>;
  }
}

export {};
