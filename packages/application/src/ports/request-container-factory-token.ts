import type { Container, Factory, ServiceIdentifier } from "inversify";

export const RequestContainerFactoryToken: ServiceIdentifier<
  Factory<Container>
> = Symbol.for("RequestContainerFactory");
