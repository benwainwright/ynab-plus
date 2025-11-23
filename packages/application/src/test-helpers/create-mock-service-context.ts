import type {
  ICommandMessage,
  IEventBus,
  ISingleItemStore,
} from "@ynab-plus/app";
import {
  Command,
  SystemContext,
  User,
  type Commands,
  type IRole,
} from "@ynab-plus/domain";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

export const createMockServiceContext = <TCommandKey extends keyof Commands>(
  key: TCommandKey,
  data: ICommandMessage<TCommandKey>["data"],
  currentUser?: IRole | string,
): {
  command: Command<TCommandKey, IRole>;
  eventBus: IEventBus;
  currentUserCache: ISingleItemStore<User>;
} => {
  const theUser: IRole | undefined =
    currentUser instanceof User || currentUser instanceof SystemContext
      ? currentUser
      : typeof currentUser === "string"
        ? User.reconstitute({
            id: currentUser,
            passwordHash: "foo",
            permissions: ["user", "admin"],
            email: "email",
          })
        : undefined;

  const command = new Command(key, data, theUser);

  const eventBus = mock<IEventBus>();

  const currentUserCache = mock<ISingleItemStore<User>>({
    get: vi.fn().mockResolvedValue(currentUser),
    require: vi.fn().mockResolvedValue(currentUser),
  });

  return { command, eventBus, currentUserCache };
};
