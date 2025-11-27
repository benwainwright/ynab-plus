import type { Container, ServiceIdentifier } from "inversify";

export const ApplicationContainerToken: ServiceIdentifier<Container> =
  Symbol.for("Container");
