import type { IHandleContext } from "@ports";
import { AbstractApplicationService } from "@core";

export class LogoutService extends AbstractApplicationService<"LogoutCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
    "admin",
  ];
  public override readonly commandName = "LogoutCommand";

  public override async handle({
    currentUserCache,
    eventBus,
  }: IHandleContext<"LogoutCommand">): Promise<undefined> {
    await currentUserCache.set(undefined);
    eventBus.emit("LogoutSuccess", undefined);
  }
}
