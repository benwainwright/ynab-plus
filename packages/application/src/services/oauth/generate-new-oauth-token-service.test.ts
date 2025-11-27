import {
  type ITaskScheduler,
  type IOauthNewTokenRequester,
  type IOauthTokenRepository,
} from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { OauthToken, RegularTask, User } from "@ynab-plus/domain";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { GenerateNewOauthTokenService } from "./generate-new-oauth-token-service.ts";

describe("generate new oauth token service", () => {
  it("gets a new token from the requester and saves it in the repository, then schedules a refresh once an hour", async () => {
    try {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
      const context = createMockServiceContext(
        "GenerateNewOauthTokenCommand",
        { provider: "ynab", code: "1-2-3" },

        User.reconstitute({
          id: "ben",
          email: "bwainwright28@gmail.com",
          passwordHash: "foo",
          permissions: ["admin"],
        }),
      );

      const save = vi.fn();

      const mockTokenRepo: IOauthTokenRepository = {
        get: vi.fn(),
        save,
        delete: vi.fn(),
        create: vi.fn(),
      };

      const mockTaskScheduler = mock<ITaskScheduler>();

      const task = RegularTask.reconstitute({
        name: "Refresh ynab Oauth token",
        description: "",
        id: "ben-ynab-token-refresh-task",
        minute: "0",
        onBehalfOf: "ben",
        triggerImmediately: true,
        command: "CheckOauthIntegrationStatusCommand",
        data: '{"provider":"ynab"}',
        hour: "*",
        day: "*",
        month: "*",
        weekDay: "*",
        created: new Date("2020-01-01T00:00:00.000Z"),
        lastExecution: undefined,
      });

      const mockToken = OauthToken.reconstitute({
        token: "foo",
        userId: "ben",
        refreshToken: "foo-refresh",
        provider: "ynab",
        expiry: new Date("2021-01-01T00:00:00.000Z"),
        created: new Date(),
        refreshed: undefined,
        lastUse: new Date(),
      });

      const requester: IOauthNewTokenRequester = {
        newToken: (userId: string, code: string) => {
          if (code === "1-2-3" && userId === "ben") {
            return Promise.resolve(mockToken);
          }

          throw new Error("Wrong code");
        },
      };

      const factory = vi.fn().mockReturnValue(requester);

      const service = new GenerateNewOauthTokenService(
        mockTokenRepo,
        factory,
        mockTaskScheduler,
        mock(),
      );

      const result = await service.doHandle(context);

      expect(result.status).toEqual("connected");
      expect(result.created).toEqual(mockToken.created);
      expect(result.expiry).toEqual(mockToken.expiry);
      expect(result.refreshed).toEqual(mockToken.refreshed);
      expect(save).toHaveBeenCalledWith(mockToken);
      expect(mockTaskScheduler.scheduleTask.mock.lastCall?.[0].id).toEqual(
        task.id,
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
