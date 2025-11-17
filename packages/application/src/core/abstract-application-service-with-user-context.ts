import type { IHandleContext } from "@ports";
import {
  type IRole,
  User,
  type Commands,
  SystemContext,
} from "@ynab-plus/domain";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import { AppError } from "@errors";

export abstract class AbstractApplicationServiceWithUserContext<
  TKey extends keyof Commands = keyof Commands,
> extends AbstractApplicationService<TKey> {
  private _user: User | undefined;

  private getUserFromRole(role: IRole | undefined) {
    if (role instanceof User) {
      return role;
    }

    if (role instanceof SystemContext && role.onBehalfOf) {
      return role.onBehalfOf;
    }

    return undefined;
  }

  protected get currentUser(): User {
    if (!this._user) {
      throw new AppError(
        `Service cannot be executed without a user based context`,
      );
    }
    return this._user;
  }

  public override async doHandle<TRole extends IRole = User>(
    context: IHandleContext<TKey, TRole>,
  ): Promise<Commands[TKey]["response"]> {
    const {
      command: { role },
    } = context;

    this._user = this.getUserFromRole(role);

    return await super.doHandle(context);
  }
}
