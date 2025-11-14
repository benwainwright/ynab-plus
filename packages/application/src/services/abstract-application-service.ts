import { NotAuthorisedError } from "@errors";
import type { ICommandMessage, IHandleContext,ISingleItemStore } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Commands, Permission, User } from "@ynab-plus/domain";

export const LOG_CONTEXT = { context: "abstract-application-service" };

export abstract class AbstractApplicationService<TKey extends keyof Commands> {
  public constructor(protected logger: ILogger) {}

  public abstract readonly commandName: TKey;
  public abstract readonly requiredPermissions: Permission[];

  public canHandle(
    command: ICommandMessage<keyof Commands>,
  ): command is ICommandMessage<TKey> {
    const result = command.key === this.commandName;

    this.logger.silly(
      `Can ${this.commandName} handle ${command.key}? ${result ? "yes" : "no"}`,
      LOG_CONTEXT,
    );

    return result;
  }

  private async currentUserPermissions(
    session: ISingleItemStore<User | undefined>,
  ): Promise<Permission[]> {
    const data = await session.get();

    if (!data || !data.permissions) {
      return ["public"];
    }

    return data.permissions;
  }

  public async doHandle(
    context: IHandleContext<TKey>,
  ): Promise<Commands[TKey]["response"]> {
    const { currentUserCache, command } = context;

    this.logger.debug(`Attempting to handle command`, {
      ...LOG_CONTEXT,
      command,
    });

    const permissions = await this.currentUserPermissions(currentUserCache);

    const hasValidPermission = Boolean(
      permissions.find((permission) =>
        this.requiredPermissions.includes(permission),
      ),
    );

    if (!hasValidPermission) {
      this.logger.silly(`Did not have valid permissions`, {
        ...LOG_CONTEXT,
      });

      const data = await currentUserCache.get();

      throw new NotAuthorisedError(
        `Not authorised to execute ${this.commandName}`,
        this.commandName,
        data?.id,
        permissions,
        this.requiredPermissions,
      );
    }

    this.logger.silly(
      `Permissions are valid, proceeding to handle`,
      LOG_CONTEXT,
    );

    const result = await this.handle(context);

    this.logger.debug(`Handling complete`, { ...LOG_CONTEXT, result });

    return result;
  }

  protected abstract handle(
    context: IHandleContext<TKey>,
  ): Promise<Commands[TKey]["response"]>;
}
