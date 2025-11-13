import { AbstractApplicationService } from "./abstract-application-service.ts";

import { User } from "@ynab-plus/domain";

import type { IPasswordHasher, IHandleContext, IRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

export class RegisterUserService extends AbstractApplicationService<"RegisterCommand"> {
  public override readonly commandName = "RegisterCommand";
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
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
    currentUserCache,
    eventBus,
  }: IHandleContext<"RegisterCommand">) {
    const { password, username, email } = command.data;

    const hash = await this.passwordHasher.hash(password);

    const user = new User({
      id: username,
      email,
      passwordHash: hash,
      permissions: ["user"],
    });

    await this.users.save(user);

    await currentUserCache.set(user);
    eventBus.emit("RegisterSuccess", undefined);
    return { success: true, id: username };
  }
}
