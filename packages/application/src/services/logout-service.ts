import { AbstractApplicationService } from "./abstract-application-service.ts";
import type { IHandleContext } from "../ports/index.ts";

export class LogoutService extends AbstractApplicationService<"Logout"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
    "admin",
  ];
  public override readonly commandName = "Logout";

  public override async handle({
    currentUserCache,
    eventBus,
  }: IHandleContext<"Logout">): Promise<undefined> {
    await currentUserCache.set(undefined);
    eventBus.emit("LogoutSuccess", undefined);
  }
}
