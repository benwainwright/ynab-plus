import type { ITaskScheduler } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { RegularTask, SystemContext } from "@ynab-plus/domain";
import { UpdateScheduledTaskService } from "./update-scheduled-task-service.ts";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

describe("update scheduled task service", () => {
  it("updates the task with the task scheduler", async () => {
    const task = new RegularTask({
      id: "foo",
      onBehalfOf: "ben",
      created: new Date("2025-12-11T20:39:37.823Z"),
      lastExecution: undefined,
      triggerImmediately: true,
      minute: "2",
      hour: "2",
      data: "{}",
      day: "1",
      month: "*",
      weekDay: "*",
      name: "Do my shopping",
      description: "A task to do my shopping",
      command: "SyncAccountsCommand",
    });

    const role = new SystemContext("id", ["system"]);

    const context = createMockServiceContext(
      "UpdateScheduledTaskCommand",
      task,
      role,
    );

    const mockRepo = mock<ITaskScheduler>();

    const existingTask = new RegularTask({
      id: "foo",
      onBehalfOf: "ben",
      triggerImmediately: true,
      created: new Date("2025-12-11T20:39:37.823Z"),
      lastExecution: undefined,
      minute: "1",
      hour: "2",
      data: "{}",
      day: "1",
      month: "*",
      weekDay: "*",
      name: "Do my shopping",
      description: "A task to do my shopping",
      command: "SyncAccountsCommand",
    });

    when(mockRepo.getTask).calledWith("foo").thenResolve(existingTask);

    const service = new UpdateScheduledTaskService(mockRepo, mock());

    const result = await service.doHandle(context);

    expect(mockRepo.updateTask).toHaveBeenCalledWith(task);
    expect(result.success).toEqual(true);
  });

  it("fails the update if there was no existing task", async () => {
    const task = new RegularTask({
      triggerImmediately: true,
      id: "foo",
      onBehalfOf: "ben",
      created: new Date("2025-12-11T20:39:37.823Z"),
      lastExecution: undefined,
      minute: "2",
      hour: "2",
      data: "{}",
      day: "1",
      month: "*",
      weekDay: "*",
      name: "Do my shopping",
      description: "A task to do my shopping",
      command: "SyncAccountsCommand",
    });

    const role = new SystemContext("id", ["system"]);

    const context = createMockServiceContext(
      "UpdateScheduledTaskCommand",
      task,
      role,
    );

    const mockRepo = mock<ITaskScheduler>();

    when(mockRepo.getTask).calledWith("foo").thenResolve(undefined);

    const service = new UpdateScheduledTaskService(mockRepo, mock());

    const result = await service.doHandle(context);

    expect(mockRepo.updateTask).not.toHaveBeenCalledWith();
    expect(result.success).toEqual(false);
  });
});
