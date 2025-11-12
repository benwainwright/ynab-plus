import { AbstractApplicationService } from "./abstract-application-service.ts";

import type { User } from "@ynab-plus/domain";
import type { IHandleContext, IRepository } from "@ports";

import { UserNotFoundError } from "@errors";

export class GetUserService extends AbstractApplicationService<"GetUser"> {
  public override readonly commandName = "GetUser";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
    "public",
    "user",
  ];

  public constructor(private users: IRepository<User>) {
    super();
  }

  protected override async handle({
    command,
  }: IHandleContext<"GetUser">): Promise<User | undefined> {
    const { username } = command.data;

    const user = await this.users.get(username);

    if (!user) {
      throw new UserNotFoundError(
        `Could not find user '${username}'`,
        username,
      );
    }

    return user;
  }
}
