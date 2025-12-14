import type { IDomainEventBuffer, ITaskScheduler } from "@ynab-plus/app";
import { RegularTask } from "@ynab-plus/domain";
import type { Mocked } from "vitest";

export const testRegularTasksRepository = (
  create: () => Promise<{
    repo: ITaskScheduler;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
    eventBuffer: Mocked<IDomainEventBuffer>;
  }>,
) => {
  describe("the regular  repository", () => {
    describe("gettasks", () => {
      it("returns an empty array if there is nothing to return", async () => {
        const { repo } = await create();

        const results = await repo.getTasks(0, 10);
        expect(results).toBeDefined();
        expect(results).toHaveLength(0);
      });
    });

    describe("getUserTasks", () => {
      it("returns an empty array if there is nothing to return", async () => {
        const { repo } = await create();
        const results = await repo.getUserTasks("foo", 0, 10);
        expect(results).toBeDefined();
        expect(results).toHaveLength(0);
      });
    });
    describe("schedule task", () => {
      it("results in a task being persisted", async () => {
        const { repo, begin, commit, eventBuffer } = await create();

        const task = RegularTask.reconstitute({
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

        await begin();
        await repo.scheduleTask(task);
        expect(eventBuffer.stageEvents).toHaveBeenCalledWith(task);
        await commit();

        const returnedTask = await repo.getTask("foo");
        expect(returnedTask).toEqual(task);
      });
    });

    describe("get all tasks", () => {
      it("gets all the tasks in the database if you dont supply a limit", async () => {
        const { repo, begin, commit, eventBuffer } = await create();
        const task = RegularTask.reconstitute({
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

        await begin();
        await repo.scheduleTask(task);

        const task2 = RegularTask.reconstitute({
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

        const johns = RegularTask.reconstitute({
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
        expect(eventBuffer.stageEvents).toHaveBeenCalledWith(task);
        expect(eventBuffer.stageEvents).toHaveBeenCalledWith(johns);
        expect(eventBuffer.stageEvents).toHaveBeenCalledWith(task2);

        await commit();

        const allTasks = await repo.getTasks(0);
        expect(allTasks).toHaveLength(3);
      });
    });

    describe("get user tasks", () => {
      it("gets all the tasks associated with a user", async () => {
        const { repo, begin, commit } = await create();
        const task = RegularTask.reconstitute({
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

        await begin();
        await repo.scheduleTask(task);

        const task2 = RegularTask.reconstitute({
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

        const johns = RegularTask.reconstitute({
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
        await commit();

        const allTasks = await repo.getUserTasks("john", 0, 30);
        expect(allTasks).toHaveLength(1);
      });
    });

    describe("delete task", () => {
      it("deletes a task", async () => {
        const { repo, begin, commit, eventBuffer } = await create();

        const task = RegularTask.reconstitute({
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

        const task2 = RegularTask.reconstitute({
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

        await begin();
        await repo.scheduleTask(task);
        await repo.scheduleTask(task2);
        await commit();

        eventBuffer.stageEvents.mockReset();

        await begin();
        await repo.deleteTask(task2);
        expect(eventBuffer.stageEvents).toHaveBeenCalledWith(task2);
        await commit();

        const returnedTask = await repo.getTask("foo");

        expect(returnedTask).toEqual(task);

        const deletedTask = await repo.getTask("foo-2");

        expect(deletedTask).toEqual(undefined);

        const allTasks = await repo.getTasks(0, 30);
        expect(allTasks).toHaveLength(1);
      });

      describe("update task", () => {
        it("can update an existing task", async () => {
          const { repo, begin, commit, eventBuffer } = await create();
          const task = RegularTask.reconstitute({
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

          await begin();
          await repo.scheduleTask(task);
          await commit();

          await begin();
          const updated = RegularTask.reconstitute({
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

          eventBuffer.stageEvents.mockReset();
          await repo.updateTask(updated);
          expect(eventBuffer.stageEvents).toHaveBeenCalledWith(updated);
          await commit();

          const returnedTask = await repo.getTask("foo");

          expect(returnedTask).toEqual(updated);

          const allTasks = await repo.getTasks(0, 30);
          expect(allTasks).toHaveLength(1);
        });

        describe("delete task", () => {
          it("deletes a task", async () => {
            const { repo, begin, commit } = await create();
            const task = RegularTask.reconstitute({
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

            const task2 = RegularTask.reconstitute({
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

            await begin();
            await repo.scheduleTask(task);
            await repo.scheduleTask(task2);
            await commit();

            await begin();
            await repo.deleteTask(task2);
            await commit();

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
};
