import { describe, expect, it } from "vitest";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import { mock } from "vitest-mock-extended";
import { NotAuthorisedError } from "@errors";
import type { Permission, User } from "@ynab-plus/domain";
import type {
  ICommandMessage,
  IEventBus,
  IHandleContext,
  ISingleItemStore,
} from "@ports";

describe("application service", () => {
  describe("canHandle", () => {
    it("returns false if the keys don't match", () => {
      class TestHandler extends AbstractApplicationService<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          _context: IHandleContext<"Logout">,
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
      class TestHandler extends AbstractApplicationService<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          _context: IHandleContext<"Logout">,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler(mock());

      const command = mock<ICommandMessage<"Logout">>({
        key: "Logout",
      });

      const result = handler.canHandle(command);
      expect(result).toBe(true);
    });
  });
  describe("doHandle", () => {
    it("executes the handle method when doHandle is called", async () => {
      let passed: IHandleContext<"Logout"> | undefined;
      class TestHandler extends AbstractApplicationService<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          context: IHandleContext<"Logout">,
        ): Promise<undefined> {
          passed = context;
        }
      }

      const handler = new TestHandler(mock());

      const command = mock<ICommandMessage<"Logout">>({
        key: "Logout",
      });

      const eventBus = mock<IEventBus>();
      const currentUserCache = mock<ISingleItemStore<User>>();
      const context = { command, eventBus, currentUserCache };

      await handler.doHandle(context);
      expect(passed).toEqual(context);
    });

    it("throws an error and doesn't execute handle if the user doesn't have the right permissions", async () => {
      let handled = false;
      class TestHandler extends AbstractApplicationService<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["admin"];

        protected override async handle(
          _context: IHandleContext<"Logout">,
        ): Promise<undefined> {
          handled = true;
        }
      }

      const command = mock<ICommandMessage<"Logout">>({
        key: "Logout",
      });

      const eventBus = mock<IEventBus>();
      const currentUserCache = mock<ISingleItemStore<User>>({
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
