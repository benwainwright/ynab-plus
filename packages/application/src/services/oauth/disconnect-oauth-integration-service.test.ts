import { mock } from "vitest-mock-extended";
import { RegularTask, User } from "@ynab-plus/domain";
import { DisconnectOauthIntegrationService } from "./disconnect-oauth-integration-service.ts";
import { type IOauthTokenRepository, type ITaskScheduler } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { when } from "vitest-when";

describe("disconnect outh integration service", () => {
  it("removes the token in the tokens database as well as the refresh task", async () => {
    const mockRepo = mock<IOauthTokenRepository>();

    const user = User.reconstitute({
      id: "ben",
      email: "bwainwright28@gmail.com",
      passwordHash: "foo",
      permissions: ["admin"],
    });

    const scheduler = mock<ITaskScheduler>();

    const service = new DisconnectOauthIntegrationService(
      mockRepo,
      scheduler,
      mock(),
    );
    const task = RegularTask.reconstitute({
      name: "Refresh ynab Oauth token",
      description: "",
      id: "ben-ynab-token-refresh-task",
      minute: "0",
      triggerImmediately: true,
      onBehalfOf: "ben",
      command: "CheckOauthIntegrationStatusCommand",
      data: '{"provider":"ynab"}',
      hour: "*",
      day: "*",
      month: "*",
      weekDay: "*",
      created: new Date("2020-01-01T00:00:00.000Z"),
      lastExecution: undefined,
    });

    when(scheduler.getTask)
      .calledWith(`ben-ynab-token-refresh-task`)
      .thenResolve(task);

    const context = createMockServiceContext(
      "DisconnectOauthIntegrationCommand",
      { provider: "ynab" },
      user,
    );

    await service.doHandle(context);

    expect(mockRepo.delete).toHaveBeenCalledWith("ben", "ynab");

    const { eventBus } = context;

    expect(eventBus.emit).toHaveBeenCalledWith("OauthIntegrationDisconnected", {
      provider: "ynab",
    });

    expect(scheduler.deleteTask).toHaveBeenCalledWith(task);
    expect(context.eventBus.emit).toHaveBeenCalledWith(
      "ScheduledTaskDeleted",
      task,
    );
  });
});
