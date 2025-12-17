import type { IHandleContext, ICurrentUserSetter } from "@ports";
import { inject, AbstractApplicationService } from "@core";

import { type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

import { injectable } from "inversify";

@injectable()
export class LogoutService extends AbstractApplicationService<"LogoutCommand"> {
  public constructor(
    @inject("CurrentUserSetter")
    private currentUserSetter: ICurrentUserSetter,

    @inject("Logger")
    logger: ILogger
  ) {
    super(logger);
  }

  public override requiredPermissions: Permission[] = ["user", "admin"];
  public override readonly commandName = "LogoutCommand";

  public override async handle<TRole extends IRole = User>({
    eventBus
  }: IHandleContext<"LogoutCommand", TRole>): Promise<undefined> {
    await this.currentUserSetter.set(undefined);
    eventBus.emit("LogoutSuccess", undefined);
  }
}
