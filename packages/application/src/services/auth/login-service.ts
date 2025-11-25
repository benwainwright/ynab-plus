import {
  CurrentUserSetterToken,
  PasswordVerifierToken,
  UserRepositoryToken,
  type IHandleContext,
  type IPasswordVerifier,
  type IRepository,
} from "@ports";

import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import type { Commands, IRole, Permission, User } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";
import type { ICurrentUserSetter } from "src/ports/i-current-user-setter.ts";
import { inject, injectable } from "inversify";

@injectable()
export class LoginService extends AbstractApplicationService<"LoginCommand"> {
  public override requiredPermissions: Permission[] = ["public"];

  public constructor(
    @inject(UserRepositoryToken)
    private users: IRepository<User>,

    @inject(PasswordVerifierToken)
    private passwordVerifier: IPasswordVerifier,

    @inject(CurrentUserSetterToken)
    private currentUserSetter: ICurrentUserSetter,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "LoginCommand";

  public override async handle<TRole extends IRole = User>({
    command,
    eventBus,
  }: IHandleContext<"LoginCommand", TRole>): Promise<
    Commands["LoginCommand"]["response"]
  > {
    const { username, password } = command.data;

    const user = await this.users.get(username);

    if (
      user &&
      (await this.passwordVerifier.verify(password, user.passwordHash))
    ) {
      await this.currentUserSetter.set(user);
      eventBus.emit("LoginSuccess", undefined);
      return { success: true, id: username };
    }
    eventBus.emit("LoginFail", undefined);
    return { success: false };
  }
}
