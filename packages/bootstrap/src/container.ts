import { Container } from "inversify";
import { ApplicationContainerToken } from "./application-container-token.ts";

export const getContainer = () => {
  const container = new Container({ defaultScope: "Request" });
  container.bind(ApplicationContainerToken).toConstantValue(container);
  return container;
};
