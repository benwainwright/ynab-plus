import {
  PasswordHasherToken,
  UserRepositoryToken,
  type IHandleContext,
  type IPasswordHasher,
  type IRepository,
} from "@ports";
import { AbstractError, LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import { User, type IRole } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";
import { inject, injectable } from "inversify";

export const LOG_CONTEXT = { context: `register-user-service` };

@injectable()
export class UpdateUserService extends AbstractApplicationService<"UpdateUserCommand"> {
  public override readonly commandName = "UpdateUserCommand";
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
  ];

  public constructor(
    @inject(UserRepositoryToken)
    private users: IRepository<User>,

    @inject(PasswordHasherToken)
    private passwordHasher: IPasswordHasher,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override async handle<TRole extends IRole>({
    command,
    eventBus,
  }: IHandleContext<"UpdateUserCommand", TRole>) {
    const { password, email, permissions, username } = command.data;

    try {
      const userToUpdate = await this.users.get(username);

      if (!userToUpdate) {
        const reason = `User ${username} does not exist`;
        eventBus.emit("UserUpdateFail", { reason });
        return { success: false, reason } as const;
      }

      const hash =
        password === ""
          ? userToUpdate.passwordHash
          : await this.passwordHasher.hash(password);

      userToUpdate.update({
        hash,
        email,
        permissions,
      });

      this.logger.verbose(`Attempting to save user in repository`, LOG_CONTEXT);

      await this.users.save(userToUpdate);
      this.logger.verbose(`Save successful!`, LOG_CONTEXT);
      return { success: true } as const;
    } catch (error) {
      if (error instanceof AbstractError) {
        eventBus.emit("UserUpdateFail", { reason: error.message });
        return { success: false, reason: error.message } as const;
      }
      throw error;
    }
  }
}
