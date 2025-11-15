import type { IHandleContext, IPasswordHasher, IRepository } from "@ports";
import { AbstractError, type ILogger } from "@ynab-plus/bootstrap";
import { User } from "@ynab-plus/domain";

import { AbstractApplicationService } from "./abstract-application-service.ts";

export const LOG_CONTEXT = { context: `register-user-service` };

export class UpdateUserService extends AbstractApplicationService<"UpdateUserCommand"> {
  public override readonly commandName = "UpdateUserCommand";
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
  ];

  public constructor(
    private users: IRepository<User>,
    private passwordHasher: IPasswordHasher,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override async handle({
    command,
    eventBus,
  }: IHandleContext<"UpdateUserCommand">) {
    const { password, email, permissions, username } = command.data;

    try {
      const userToUpdate = await this.users.get(username);

      if (!userToUpdate) {
        const reason = `User ${username} does not exist`;
        eventBus.emit("UserUpdateFail", { reason });
        return { success: false, reason } as const;
      }

      const hash = await this.passwordHasher.hash(password);

      userToUpdate.passwordHash = hash;
      userToUpdate.email = email;
      userToUpdate.permissions = permissions;

      this.logger.verbose(`Attempting to save user in repository`, LOG_CONTEXT);

      await this.users.save(userToUpdate);
      this.logger.verbose(`Save successful!`, LOG_CONTEXT);

      eventBus.emit("UserUpdated", userToUpdate);
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
