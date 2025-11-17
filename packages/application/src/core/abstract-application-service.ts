import { AppError, NotAuthorisedError } from "@errors";
import type { IHandleContext } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import {
  SystemContext,
  User,
  type Command,
  type Commands,
  type IRole,
  type Permission,
} from "@ynab-plus/domain";

export const LOG_CONTEXT = { context: "abstract-application-service" };

export abstract class AbstractApplicationService<
  TKey extends keyof Commands = keyof Commands,
> {
  public constructor(protected logger: ILogger) {}

  public abstract readonly commandName: TKey;
  public abstract readonly requiredPermissions: Permission[];
  private _user: User | undefined;

  public canHandle<TRole extends IRole>(
    command: Command<keyof Commands, TRole>,
  ): command is Command<TKey, TRole> {
    const result = command.key === this.commandName;

    this.logger.silly(
      `Can ${this.commandName} handle ${command.key}? ${result ? "yes" : "no"}`,
      LOG_CONTEXT,
    );

    return result;
  }

  private currentRolePermissions(role: IRole | undefined): Permission[] {
    if (!role) {
      return ["public"];
    }

    return role.permissions;
  }

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

  private checkIsAuthorised<TRole extends IRole>(
    context: IHandleContext<TKey, TRole>,
  ) {
    const { command } = context;
    const permissions = this.currentRolePermissions(command.role);
    this._user = this.getUserFromRole(command.role);

    const hasValidPermission = Boolean(
      permissions.find((permission) =>
        this.requiredPermissions.includes(permission),
      ),
    );

    if (hasValidPermission) {
      this.logger.silly(
        `Permissions are valid, proceeding to handle`,
        LOG_CONTEXT,
      );
      return;
    }

    this.logger.silly(`Did not have valid permissions`, {
      ...LOG_CONTEXT,
    });

    throw new NotAuthorisedError(
      `Not authorised to execute ${this.commandName}`,
      this.commandName,
      command.role,
      this.requiredPermissions,
    );
  }

  public async doHandle<TRole extends IRole = User>(
    context: IHandleContext<TKey, TRole>,
  ): Promise<Commands[TKey]["response"]> {
    const { command } = context;

    this.logger.debug(`Attempting to handle command`, {
      ...LOG_CONTEXT,
      command,
    });

    this.checkIsAuthorised(context);

    const result = await this.handle(context);

    this.logger.debug(`Handling complete`, { ...LOG_CONTEXT, result });

    return result;
  }

  protected abstract handle<TRole extends IRole = User>(
    context: IHandleContext<TKey, TRole>,
  ): Promise<Commands[TKey]["response"]>;
}
