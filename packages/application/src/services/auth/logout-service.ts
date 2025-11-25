import type { IHandleContext } from "@ports";
import { AbstractApplicationService } from "@core";
import {
  CurrentUserSetterToken,
  type ICurrentUserSetter,
} from "src/ports/i-current-user-setter.ts";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";
import { inject, injectable } from "inversify";

@injectable()
export class LogoutService extends AbstractApplicationService<"LogoutCommand"> {
  public constructor(
    @inject(CurrentUserSetterToken)
    private currentUserSetter: ICurrentUserSetter,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override requiredPermissions: Permission[] = ["user", "admin"];
  public override readonly commandName = "LogoutCommand";

  public override async handle<TRole extends IRole = User>({
    eventBus,
  }: IHandleContext<"LogoutCommand", TRole>): Promise<undefined> {
    await this.currentUserSetter.set(undefined);
    eventBus.emit("LogoutSuccess", undefined);
  }
}
