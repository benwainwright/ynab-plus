import type { IHandleContext } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, User } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";
import type { IMultipleRepository } from "src/ports/i-multiple-repository.ts";

export class ListUsersService extends AbstractApplicationService<"ListUsersCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
  ];

  public constructor(
    private users: IMultipleRepository<User>,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListUsersCommand";

  public override async handle<TRole extends IRole>({
    command,
  }: IHandleContext<"ListUsersCommand", TRole>): Promise<User[]> {
    const { offset, limit } = command.data;

    return await this.users.getMany(offset, limit);
  }
}
