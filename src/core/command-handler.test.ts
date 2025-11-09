import { describe, expect, it } from "bun:test";
import { CommandHandler } from "./command-handler.ts";
import { mock } from "bun-mock-extended";
import {
  type ICommandMessage,
  type IEventBus,
  type IHandleContext,
  type ISessionData,
  type IStore,
  type Permission,
} from "@types";
import { NotAuthorisedError } from "@errors";

describe("command handler", () => {
  describe("canHandle", () => {
    it("returns false if the keys don't match", () => {
      class TestHandler extends CommandHandler<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          _context: IHandleContext<"Logout">,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler();

      const command = mock<ICommandMessage<"LoginCommand">>({
        key: "LoginCommand",
      });

      const result = handler.canHandle(command);
      expect(result).toBeFalse();
    });

    it("returns true if the keys match", () => {
      class TestHandler extends CommandHandler<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          _context: IHandleContext<"Logout">,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler();

      const command = mock<ICommandMessage<"Logout">>({
        key: "Logout",
      });

      const result = handler.canHandle(command);
      expect(result).toBeTrue();
    });
  });
  describe("doHandle", () => {
    it.only("executes the handle method when doHandle is called", async () => {
      let passed: IHandleContext<"Logout"> | undefined;
      class TestHandler extends CommandHandler<"Logout"> {
        public override readonly commandName = "Logout";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle(
          context: IHandleContext<"Logout">,
        ): Promise<undefined> {
          passed = context;
        }
      }

      const handler = new TestHandler();

      const command = mock<ICommandMessage<"Logout">>({
        key: "Logout",
      });

      const eventBus = mock<IEventBus>();
      const session = mock<IStore<ISessionData>>();
      const context = { command, eventBus, session };

      await handler.doHandle(context);

      expect(passed).toEqual(context);
    });

    it("throws an error and doesn't execute handle if the user doesn't have the right permissions", async () => {
      let handled = false;
      class TestHandler extends CommandHandler<"Logout"> {
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
      const session = mock<IStore<ISessionData>>({
        get: async () => ({ userId: "test", permissions: ["user"] }),
      });

      const handler = new TestHandler();

      const context = { command, eventBus, session };

      await expect(handler.doHandle(context)).rejects.toThrow(
        NotAuthorisedError,
      );
      expect(handled).toBeFalse();
    });
  });
});
