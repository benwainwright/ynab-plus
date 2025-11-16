import type { ITaskScheduler } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { RegularTask, User } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { ListScheduledTasksService } from "./list-scheduled-tasks-service.ts";

describe("list ScheduledTasks service", () => {
  it("returns a list of all the ScheduledTasks, passing through the offset and limit", async () => {
    const mockUser = new User({
      id: "ben",
      passwordHash: "foo",
      permissions: ["admin"],
      email: "email",
    });

    const mockTaskList = [
      new RegularTask({
        id: "foo",
        onBehalfOf: "ben",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "1",
        data: "",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      }),

      new RegularTask({
        id: "foo-2",
        onBehalfOf: "ben",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        data: "{}",
        minute: "1",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      }),
    ];

    const context = createMockServiceContext(
      "ListScheduledTasksCommand",
      { offset: 0, limit: 30 },
      mockUser,
    );

    const repo = mock<ITaskScheduler>();

    when(repo.getTasks).calledWith(0, 30).thenResolve(mockTaskList);

    const service = new ListScheduledTasksService(repo, mock());

    const result = await service.doHandle(context);

    expect(result).toEqual(mockTaskList);
  });
});
