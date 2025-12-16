import {
  type IHandleContext,
  type IMultipleRepository,
  type IPasswordVerifier,
  type IRepository,
  type ICurrentUserSetter,
} from "@ports";

import { type ILogger } from "@ynab-plus/bootstrap";
import type { Commands, IRole, Permission, User } from "@ynab-plus/domain";

import { inject, AbstractApplicationService } from "@core";
import { injectable } from "inversify";

@injectable()
export class LoginService extends AbstractApplicationService<"LoginCommand"> {
  public override requiredPermissions: Permission[] = ["public"];

  public constructor(
    @inject("UserRepository")
    private users: IRepository<User> & IMultipleRepository<User>,

    @inject("PasswordVerifier")
    private passwordVerifier: IPasswordVerifier,

    @inject("CurrentUserSetter")
    private currentUserSetter: ICurrentUserSetter,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "LoginCommand";

  public override async handle<TRole extends IRole = User>({
    command,
    eventBus,
  }: IHandleContext<"LoginCommand", TRole>): Promise<Commands["LoginCommand"]["response"]> {
    const { username, password } = command.data;

    const user = await this.users.get(username);

    if (user && (await this.passwordVerifier.verifyPassword(password, user.passwordHash))) {
      await this.currentUserSetter.set(user);
      eventBus.emit("LoginSuccess", undefined);
      return { success: true, id: username };
    }
    eventBus.emit("LoginFail", undefined);
    return { success: false };
  }
}
