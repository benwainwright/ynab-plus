import type { ConfigValue } from "@ynab-plus/bootstrap";
import { RegularTask } from "@ynab-plus/domain";
import { SqliteRegularTaskRepository } from "./sqlite-regular-tasks-repository.ts";
import { describe, expect, it } from "vitest";

import { SqliteDatabase } from "./sqlite-database.ts";

describe("the regular  repository", () => {
  describe("gettasks", () => {
    it("returns an empty array if there is nothing to return", async () => {
      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const tableName: ConfigValue<string> = {
        value: Promise.resolve("tasks"),
      };

      const repo = new SqliteRegularTaskRepository(tableName, database);

      await repo.create();

      const results = await repo.getTasks(0, 10);
      expect(results).toBeDefined();
      expect(results).toHaveLength(0);
    });
  });

  describe("getUserTasks", () => {
    it("returns an empty array if there is nothing to return", async () => {
      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const tableName: ConfigValue<string> = {
        value: Promise.resolve("tasks"),
      };

      const repo = new SqliteRegularTaskRepository(tableName, database);

      await repo.create();

      const results = await repo.getUserTasks("foo", 0, 10);
      expect(results).toBeDefined();
      expect(results).toHaveLength(0);
    });
  });
  describe("schedule task", () => {
    it("results in a task being persisted", async () => {
      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const tableName: ConfigValue<string> = {
        value: Promise.resolve("tasks"),
      };

      const repo = new SqliteRegularTaskRepository(tableName, database);

      await repo.create();

      const task = new RegularTask({
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

      await repo.scheduleTask(task);

      const returnedTask = await repo.getTask("foo");
      expect(returnedTask).toEqual(task);
    });
  });

  describe("get all tasks", () => {
    it("gets all the tasks in the database if you dont supply a limit", async () => {
      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const tableName: ConfigValue<string> = {
        value: Promise.resolve("tasks"),
      };

      const repo = new SqliteRegularTaskRepository(tableName, database);

      await repo.create();

      const task = new RegularTask({
        triggerImmediately: false,
        id: "foo",
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
      });

      await repo.scheduleTask(task);

      const task2 = new RegularTask({
        triggerImmediately: true,
        id: "foo-3",
        data: "{}",
        onBehalfOf: "ben",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "1",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      });

      await repo.scheduleTask(task2);

      const johns = new RegularTask({
        triggerImmediately: false,
        id: "foo-4",
        data: "{}",
        onBehalfOf: "john",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "3",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      });
      await repo.scheduleTask(johns);

      const allTasks = await repo.getTasks(0);
      expect(allTasks).toHaveLength(3);
    });
  });

  describe("get user tasks", () => {
    it("gets all the tasks associated with a user", async () => {
      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const tableName: ConfigValue<string> = {
        value: Promise.resolve("tasks"),
      };

      const repo = new SqliteRegularTaskRepository(tableName, database);

      await repo.create();

      const task = new RegularTask({
        triggerImmediately: true,
        id: "foo",
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
      });

      await repo.scheduleTask(task);

      const task2 = new RegularTask({
        triggerImmediately: true,
        id: "foo-3",
        data: "{}",
        onBehalfOf: "ben",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "1",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      });

      await repo.scheduleTask(task2);

      const johns = new RegularTask({
        triggerImmediately: true,
        id: "foo-4",
        data: "{}",
        onBehalfOf: "john",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "3",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      });
      await repo.scheduleTask(johns);

      const allTasks = await repo.getUserTasks("john", 0, 30);
      expect(allTasks).toHaveLength(1);
    });
  });

  describe("delete task", () => {
    it("deletes a task", async () => {
      const database = new SqliteDatabase({
        value: Promise.resolve(":memory:"),
      });

      const tableName: ConfigValue<string> = {
        value: Promise.resolve("tasks"),
      };

      const repo = new SqliteRegularTaskRepository(tableName, database);

      await repo.create();

      const task = new RegularTask({
        triggerImmediately: true,
        id: "foo",
        data: "{}",
        onBehalfOf: "ben",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "1",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      });

      const task2 = new RegularTask({
        triggerImmediately: true,
        id: "foo-2",
        data: "{}",
        onBehalfOf: "ben",
        created: new Date("2025-12-11T20:39:37.823Z"),
        lastExecution: undefined,
        minute: "1",
        hour: "2",
        day: "1",
        month: "*",
        weekDay: "*",
        name: "Do my shopping",
        description: "A task to do my shopping",
        command: "SyncAccountsCommand",
      });

      await repo.scheduleTask(task);
      await repo.scheduleTask(task2);

      await repo.deleteTask(task2);

      const returnedTask = await repo.getTask("foo");

      expect(returnedTask).toEqual(task);

      const deletedTask = await repo.getTask("foo-2");

      expect(deletedTask).toEqual(undefined);

      const allTasks = await repo.getTasks(0, 30);
      expect(allTasks).toHaveLength(1);
    });

    describe("update task", () => {
      it("can update an existing task", async () => {
        const database = new SqliteDatabase({
          value: Promise.resolve(":memory:"),
        });

        const tableName: ConfigValue<string> = {
          value: Promise.resolve("tasks"),
        };

        const repo = new SqliteRegularTaskRepository(tableName, database);

        await repo.create();

        const task = new RegularTask({
          triggerImmediately: true,
          id: "foo",
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
        });

        await repo.scheduleTask(task);

        const updated = new RegularTask({
          triggerImmediately: false,
          id: "foo",
          onBehalfOf: "ben",
          created: new Date("2025-12-11T20:39:37.823Z"),
          lastExecution: undefined,
          minute: "3",
          data: "{}",
          hour: "2",
          day: "1",
          month: "*",
          weekDay: "*",
          name: "Do my shopping",
          description: "A task to do my shopping",
          command: "SyncAccountsCommand",
        });
        await repo.updateTask(updated);

        const returnedTask = await repo.getTask("foo");

        expect(returnedTask).toEqual(updated);

        const allTasks = await repo.getTasks(0, 30);
        expect(allTasks).toHaveLength(1);
      });

      describe("delete task", () => {
        it("deletes a task", async () => {
          const database = new SqliteDatabase({
            value: Promise.resolve(":memory:"),
          });

          const tableName: ConfigValue<string> = {
            value: Promise.resolve("tasks"),
          };

          const repo = new SqliteRegularTaskRepository(tableName, database);

          await repo.create();

          const task = new RegularTask({
            triggerImmediately: true,

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
          });

          const task2 = new RegularTask({
            triggerImmediately: true,
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
          });

          await repo.scheduleTask(task);
          await repo.scheduleTask(task2);

          await repo.deleteTask(task2);

          const returnedTask = await repo.getTask("foo");

          expect(returnedTask).toEqual(task);

          const deletedTask = await repo.getTask("foo-2");

          expect(deletedTask).toEqual(undefined);

          const allTasks = await repo.getTasks(0, 30);
          expect(allTasks).toHaveLength(1);
        });
      });
    });
  });
});
