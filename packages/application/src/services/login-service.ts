import { AbstractApplicationService } from "./abstract-application-service.ts";

import type { IHandleContext, IPasswordVerifier, IRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

import type { Commands, Permission, User } from "@ynab-plus/domain";

export class LoginService extends AbstractApplicationService<"LoginCommand"> {
  public override requiredPermissions: Permission[] = ["public"];

  public constructor(
    private users: IRepository<User>,
    private passwordVerifier: IPasswordVerifier,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "LoginCommand";

  public override async handle({
    command,
    currentUserCache,
    eventBus,
  }: IHandleContext<"LoginCommand">): Promise<
    Commands["LoginCommand"]["response"]
  > {
    const { username, password } = command.data;

    const user = await this.users.get(username);

    if (
      user &&
      (await this.passwordVerifier.verify(password, user.passwordHash))
    ) {
      await currentUserCache.set(user);
      eventBus.emit("LoginSuccess", undefined);
      return { success: true, id: username };
    }
    eventBus.emit("LoginFail", undefined);
    return { success: false };
  }
}
