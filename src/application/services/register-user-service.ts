import { ApplicationService } from "../application-service.ts";
import type { IPasswordHasher } from "../ports/i-password-hasher.ts";

import { User } from "@domain";
import type { IHandleContext, IRepository } from "../ports/index.ts";

export class RegisterUserService extends ApplicationService<"RegisterCommand"> {
  public override readonly commandName = "RegisterCommand";
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "public",
  ];

  public constructor(
    private users: IRepository<User>,

    private passwordHasher: IPasswordHasher,
  ) {
    super();
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
