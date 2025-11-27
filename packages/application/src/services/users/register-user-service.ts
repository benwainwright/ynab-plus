import {
  CurrentUserSetterToken,
  PasswordHasherToken,
  UserRepositoryToken,
  type IHandleContext,
  type IPasswordHasher,
  type IRepository,
} from "@ports";
import { AbstractError, LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import { User, type IRole } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";
import type { ICurrentUserSetter } from "src/ports/i-current-user-setter.ts";
import { inject, injectable, optional } from "inversify";

export const LOG_CONTEXT = { context: `register-user-service` };

@injectable()
export class RegisterUserService extends AbstractApplicationService<"RegisterCommand"> {
  public override readonly commandName = "RegisterCommand";
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
  ];

  public constructor(
    @inject(UserRepositoryToken)
    private users: IRepository<User>,

    @inject(PasswordHasherToken)
    private passwordHasher: IPasswordHasher,

    @inject(LoggerToken)
    logger: ILogger,

    @optional()
    @inject(CurrentUserSetterToken)
    private currentUserSetter?: ICurrentUserSetter,
  ) {
    super(logger);
  }

  public override async handle<TRole extends IRole>({
    command,
    eventBus,
  }: IHandleContext<"RegisterCommand", TRole>) {
    const { password, username, email } = command.data;

    const hash = await this.passwordHasher.hash(password);

    const user = User.reconstitute({
      id: username,
      email,
      passwordHash: hash,
      permissions: ["user"],
    });

    this.logger.verbose(`Attempting to save user in repository`, LOG_CONTEXT);
    try {
      await this.users.save(user);
      this.logger.verbose(`Save successful!`, LOG_CONTEXT);

      await this.currentUserSetter?.set(user);
      eventBus.emit("RegisterSuccess", undefined);
      return { success: true, id: username } as const;
    } catch (error) {
      if (error instanceof AbstractError) {
        eventBus.emit("RegisterFail", { reason: error.message });
        return { success: false, reason: error.message } as const;
      }
      throw error;
    }
  }
}
