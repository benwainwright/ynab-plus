import { RegularTask } from "./regular-task.ts";

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("the regular task domain model", () => {
  describe("freeze dry", () => {
    it("returns an object version of the value object", () => {
      const task = RegularTask.reconstitute({
        id: "foo",
        onBehalfOf: "ben",
        created: new Date(),
        triggerImmediately: true,
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

      expect(task.freezeDry()).toEqual({
        id: "foo",
        onBehalfOf: "ben",
        created: new Date(),
        triggerImmediately: true,
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
    });
  });

  it("raises an event when created", () => {
    const task = RegularTask.create({
      id: "foo",
      onBehalfOf: "ben",
      triggerImmediately: true,
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

    expect(task.pullEvents()).toEqual([
      {
        event: "RegularTaskCreated",
        data: task,
      },
    ]);
  });

  it("allows you to update the task and raises an event when you do", () => {
    const task = RegularTask.reconstitute({
      id: "foo",
      onBehalfOf: "ben",
      created: new Date(),
      triggerImmediately: true,
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

    task.updateTask({
      name: "foo",
      description: "bar",
    });

    expect(task.pullEvents()).toEqual([
      {
        event: "RegularTaskUpdated",
        data: {
          old: RegularTask.reconstitute({
            id: "foo",
            onBehalfOf: "ben",
            created: new Date(),
            triggerImmediately: true,
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
          }),
          new: RegularTask.reconstitute({
            id: "foo",
            onBehalfOf: "ben",
            created: new Date(),
            triggerImmediately: true,
            lastExecution: undefined,
            minute: "1",
            hour: "2",
            data: "{}",
            day: "1",
            month: "*",
            weekDay: "*",
            name: "foo",
            description: "bar",
            command: "SyncAccountsCommand",
          }),
        },
      },
    ]);
  });

  it("raises an event when deleted", () => {
    const task = RegularTask.reconstitute({
      id: "foo",
      onBehalfOf: "ben",
      created: new Date(),
      triggerImmediately: true,
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

    task.delete();

    expect(task.pullEvents()).toEqual([
      {
        event: "RegularTaskDeleted",
        data: task,
      },
    ]);
  });
});
