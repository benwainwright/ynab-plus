import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

import type {
  ICommandMessage,
  IEventBus,
  ISingleItemStore,
} from "@ynab-plus/app";

import type { Commands, User } from "@ynab-plus/domain";

export const createMockServiceContext = <TCommandKey extends keyof Commands>(
  key: TCommandKey,
  data: ICommandMessage<TCommandKey>["data"],
  currentUser?: User,
): {
  command: ICommandMessage<TCommandKey>;
  eventBus: IEventBus;
  currentUserCache: ISingleItemStore<User>;
} => {
  const command: ICommandMessage<TCommandKey> = {
    key,
    id: "foo",
    data,
  };

  const eventBus = mock<IEventBus>();

  const currentUserCache = mock<ISingleItemStore<User>>({
    get: vi.fn().mockResolvedValue(currentUser),
  });

  return { command, eventBus, currentUserCache };
};
