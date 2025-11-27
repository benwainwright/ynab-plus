import type { Container, Factory, ServiceIdentifier } from "inversify";
import type { ISessionIdRequester } from "./i-session-id-requester.ts";

export const RequestContainerFactoryToken: ServiceIdentifier<
  Factory<(sessionIdRequest: ISessionIdRequester) => Promise<Container>>
> = Symbol.for("RequestContainerFactory");
