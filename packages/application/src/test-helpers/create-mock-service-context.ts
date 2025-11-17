import type {
  ICommandMessage,
  IEventBus,
  ISingleItemStore,
} from "@ynab-plus/app";
import {
  Command,
  type Commands,
  type IRole,
  type User,
} from "@ynab-plus/domain";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

export const createMockServiceContext = <
  TCommandKey extends keyof Commands,
  TRole extends IRole,
>(
  key: TCommandKey,
  data: ICommandMessage<TCommandKey>["data"],
  currentUser?: TRole,
): {
  command: Command<TCommandKey, TRole>;
  eventBus: IEventBus;
  currentUserCache: ISingleItemStore<User>;
} => {
  const command = new Command(key, data, currentUser);

  const eventBus = mock<IEventBus>();

  const currentUserCache = mock<ISingleItemStore<User>>({
    get: vi.fn().mockResolvedValue(currentUser),
    require: vi.fn().mockResolvedValue(currentUser),
  });

  return { command, eventBus, currentUserCache };
};
