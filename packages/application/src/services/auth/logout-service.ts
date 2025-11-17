import type { IHandleContext } from "@ports";
import { AbstractApplicationService } from "@core";
import type { ICurrentUserSetter } from "src/ports/i-current-user-setter.ts";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, User } from "@ynab-plus/domain";

export class LogoutService extends AbstractApplicationService<"LogoutCommand"> {
  public constructor(
    private currentUserSetter: ICurrentUserSetter,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
    "admin",
  ];
  public override readonly commandName = "LogoutCommand";

  public override async handle<TRole extends IRole = User>({
    eventBus,
  }: IHandleContext<"LogoutCommand", TRole>): Promise<undefined> {
    await this.currentUserSetter.set(undefined);
    eventBus.emit("LogoutSuccess", undefined);
  }
}
