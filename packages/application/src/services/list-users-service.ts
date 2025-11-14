import type { IHandleContext, IRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { User } from "@ynab-plus/domain";

import { AbstractApplicationService } from "./abstract-application-service.ts";

export class ListUsersService extends AbstractApplicationService<"ListUsersCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
  ];

  public constructor(
    private users: IRepository<User>,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListUsersCommand";

  public override async handle({
    command,
  }: IHandleContext<"ListUsersCommand">): Promise<User[]> {
    const { offset, limit } = command.data;

    return await this.users.getMany(offset, limit);
  }
}
