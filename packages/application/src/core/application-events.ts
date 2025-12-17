import type { AccountsEvents, LoginEvents, OauthEvents, UserEvents } from "@services";
import type { CoreEvents } from "./core-events.ts";

export type ApplicationEvents = LoginEvents &
  AccountsEvents &
  OauthEvents &
  UserEvents &
  CoreEvents;
