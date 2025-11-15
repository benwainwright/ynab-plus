import { NotAuthorisedError } from "@errors";
import type {
  ICommandMessage,
  IEventBus,
  IHandleContext,
  ISingleItemStore,
} from "@ports";
import type { Permission, User } from "@ynab-plus/domain";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";

import { AbstractApplicationService } from "./abstract-application-service.ts";

describe("application service", () => {
  describe("canHandle", () => {
    it("returns false if the keys don't match", () => {
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          _context: IHandleContext<"LogoutCommand">,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler(mock());

      const command = mock<ICommandMessage<"LoginCommand">>({
        key: "LoginCommand",
      });

      const result = handler.canHandle(command);
      expect(result).toBe(false);
    });

    it("returns true if the keys match", () => {
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          _context: IHandleContext<"LogoutCommand">,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler(mock());

      const command = mock<ICommandMessage<"LogoutCommand">>({
        key: "LogoutCommand",
      });

      const result = handler.canHandle(command);
      expect(result).toBe(true);
    });
  });
  describe("doHandle", () => {
    it("executes the handle method when doHandle is called", async () => {
      let passed: IHandleContext<"LogoutCommand"> | undefined;
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["public"];

        // eslint-disable-next-line @typescript-eslint/require-await
        protected override async handle(
          context: IHandleContext<"LogoutCommand">,
        ): Promise<undefined> {
          passed = context;
        }
      }

      const handler = new TestHandler(mock());

      const command = mock<ICommandMessage<"LogoutCommand">>({
        key: "LogoutCommand",
      });

      const eventBus = mock<IEventBus>();
      const currentUserCache = mock<ISingleItemStore<User>>();
      const context = { command, eventBus, currentUserCache };

      await handler.doHandle(context);
      expect(passed).toEqual(context);
    });

    it("Will still allow a handle if user only has one of the required permissions", async () => {
      let handled = false;
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = [
          "user",
          "admin",
        ];

        // eslint-disable-next-line @typescript-eslint/require-await
        protected override async handle(
          _context: IHandleContext<"LogoutCommand">,
        ): Promise<undefined> {
          handled = true;
        }
      }

      const command = mock<ICommandMessage<"LogoutCommand">>({
        key: "LogoutCommand",
      });

      const eventBus = mock<IEventBus>();
      const currentUserCache = mock<ISingleItemStore<User>>({
        // eslint-disable-next-line @typescript-eslint/require-await
        get: async () =>
          mock<User>({
            id: "test",
            permissions: ["admin"],
            email: "a@b.c",
            passwordHash: "foo",
          }),
      });

      const handler = new TestHandler(mock());

      const context = { command, eventBus, currentUserCache };

      await handler.doHandle(context);
      expect(handled).toBe(true);
    });

    it("throws an error and doesn't execute handle if the user doesn't have the right permissions", async () => {
      let handled = false;
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["admin"];

        // eslint-disable-next-line @typescript-eslint/require-await
        protected override async handle(
          _context: IHandleContext<"LogoutCommand">,
        ): Promise<undefined> {
          handled = true;
        }
      }

      const command = mock<ICommandMessage<"LogoutCommand">>({
        key: "LogoutCommand",
      });

      const eventBus = mock<IEventBus>();
      const currentUserCache = mock<ISingleItemStore<User>>({
        // eslint-disable-next-line @typescript-eslint/require-await
        get: async () =>
          mock<User>({
            id: "test",
            permissions: ["user"],
            email: "a@b.c",
            passwordHash: "foo",
          }),
      });

      const handler = new TestHandler(mock());

      const context = { command, eventBus, currentUserCache };

      await expect(handler.doHandle(context)).rejects.toThrow(
        NotAuthorisedError,
      );
      expect(handled).toBe(false);
    });
  });
});
