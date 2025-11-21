import { NotAuthorisedError } from "@errors";
import type { IEventBus, IHandleContext } from "@ports";
import { Command, type IRole, type Permission, User } from "@ynab-plus/domain";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";

import { AbstractApplicationService } from "./abstract-application-service.ts";

describe("application service", () => {
  describe("canHandle", () => {
    it("returns false if the keys don't match", () => {
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle<TRole extends IRole = User>(
          _context: IHandleContext<"LogoutCommand", TRole>,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler(mock());

      const command = new Command(
        "LoginCommand",
        { username: "foo", password: "bar" },
        undefined,
      );

      const result = handler.canHandle(command);
      expect(result).toBe(false);
    });

    it("returns true if the keys match", () => {
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["public"];

        protected override async handle<TRole extends IRole = User>(
          _context: IHandleContext<"LogoutCommand", TRole>,
        ): Promise<undefined> {}
      }

      const handler = new TestHandler(mock());

      const command = new Command("LogoutCommand", undefined, undefined);

      const result = handler.canHandle(command);
      expect(result).toBe(true);
    });
  });
  describe("doHandle", () => {
    it("executes the handle method when doHandle is called", async () => {
      let passed: IHandleContext<"LogoutCommand", IRole> | undefined;
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["public"];

        // eslint-disable-next-line @typescript-eslint/require-await
        protected override async handle<TRole extends IRole = User>(
          context: IHandleContext<"LogoutCommand", TRole>,
        ): Promise<undefined> {
          passed = context;
        }
      }

      const handler = new TestHandler(mock());

      const command = new Command("LogoutCommand", undefined, undefined);

      const eventBus = mock<IEventBus>();
      const context = { command, eventBus };

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
        protected override async handle<TRole extends IRole = User>(
          _context: IHandleContext<"LogoutCommand", TRole>,
        ): Promise<undefined> {
          handled = true;
        }
      }

      const user = User.reconstitute({
        id: "test",
        permissions: ["admin"],
        email: "a@b.c",
        passwordHash: "foo",
      });

      const command = new Command("LogoutCommand", undefined, user);

      const eventBus = mock<IEventBus>();

      const handler = new TestHandler(mock());

      const context = { command, eventBus };

      await handler.doHandle(context);
      expect(handled).toBe(true);
    });

    it("throws an error and doesn't execute handle if the user doesn't have the right permissions", async () => {
      let handled = false;
      class TestHandler extends AbstractApplicationService<"LogoutCommand"> {
        public override readonly commandName = "LogoutCommand";

        public override readonly requiredPermissions: Permission[] = ["admin"];

        // eslint-disable-next-line @typescript-eslint/require-await
        protected override async handle<TRole extends IRole = User>(
          _context: IHandleContext<"LogoutCommand", TRole>,
        ): Promise<undefined> {
          handled = true;
        }
      }

      const user = User.reconstitute({
        id: "test",
        permissions: ["user"],
        email: "a@b.c",
        passwordHash: "foo",
      });

      const command = new Command("LogoutCommand", undefined, user);

      const eventBus = mock<IEventBus>();

      const handler = new TestHandler(mock());

      const context = { command, eventBus };

      await expect(handler.doHandle(context)).rejects.toThrow(
        NotAuthorisedError,
      );
      expect(handled).toBe(false);
    });
  });
});
