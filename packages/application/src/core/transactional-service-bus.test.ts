import type { IEventBus, IServiceBus, IUnitOfWork } from "@ports";
import { mock } from "vitest-mock-extended";
import { TransactionalServiceBus } from "./transactional-service-bus.ts";
import { type ILogger } from "@ynab-plus/bootstrap";
import {
  BankConnection,
  Command,
  type Commands,
  type DomainEvents,
  type IEvent,
} from "@ynab-plus/domain";
import { when } from "vitest-when";

describe("transactional service bus", () => {
  it("passes the command to the parent service bus and executes it", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    unit.drainEvents.mockReturnValue([]);
    const events = mock<IEventBus>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();
    const mockResult = mock<Commands[keyof Commands]["response"]>();

    when(parent.execute).calledWith(mockCommand).thenResolve(mockResult);

    const result = await bus.execute(mockCommand);

    expect(result).toEqual(mockResult);
  });

  it("wraps command execution with begin and commit", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    unit.drainEvents.mockReturnValue([]);
    const events = mock<IEventBus>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();
    const mockResult = mock<Commands[keyof Commands]["response"]>();

    when(parent.execute).calledWith(mockCommand).thenResolve(mockResult);

    await bus.execute(mockCommand);

    expect(unit.begin).toHaveBeenCalledBefore(parent.execute);
    expect(unit.commit).toHaveBeenCalledAfter(parent.execute);
  });

  it("calls rollback and rethrows error if there is an error in commit", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    unit.drainEvents.mockReturnValue([]);
    const events = mock<IEventBus>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();
    const mockResult = mock<Commands[keyof Commands]["response"]>();

    when(parent.execute).calledWith(mockCommand).thenResolve(mockResult);

    when(unit.commit).calledWith().thenReject(new Error());

    await expect(bus.execute(mockCommand)).rejects.toThrow();

    expect(unit.rollback).toHaveBeenCalled();
  });

  it("calls rollback and rethrows error if there is an error in the service bus execute method", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    unit.drainEvents.mockReturnValue([]);
    const events = mock<IEventBus>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();

    when(parent.execute).calledWith(mockCommand).thenReject(new Error());

    await expect(bus.execute(mockCommand)).rejects.toThrow();

    expect(unit.rollback).toHaveBeenCalled();
  });

  it("emits any collected events on commit", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    const emittedEvents: IEvent<DomainEvents, keyof DomainEvents>[] = [
      {
        event: "BankConnectionCreated",
        data: BankConnection.reconstite({
          bankName: "foo",
          id: "foo",
          userId: "ben",
          logo: "bar",
          requisitionId: "baz",
        }),
      },
      {
        event: "BankConnectionCreated",
        data: BankConnection.reconstite({
          bankName: "foo-bar",
          id: "foo",
          userId: "ben",
          logo: "bar",
          requisitionId: "baz",
        }),
      },
    ];

    unit.drainEvents.mockReturnValue(emittedEvents);

    const events = mock<IEventBus>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();

    await bus.execute(mockCommand);

    expect(events.emit).toHaveBeenCalledWith(
      emittedEvents[0]?.event,
      emittedEvents[0]?.data,
    );
    expect(events.emit).toHaveBeenCalledWith(
      emittedEvents[1]?.event,
      emittedEvents[1]?.data,
    );
  });

  it("does not emit events if there is an error", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    const emittedEvents: IEvent<DomainEvents, keyof DomainEvents>[] = [
      {
        event: "BankConnectionCreated",
        data: BankConnection.reconstite({
          bankName: "foo",
          id: "foo",
          userId: "ben",
          logo: "bar",
          requisitionId: "baz",
        }),
      },
      {
        event: "BankConnectionCreated",
        data: BankConnection.reconstite({
          bankName: "foo-bar",
          id: "foo",
          userId: "ben",
          logo: "bar",
          requisitionId: "baz",
        }),
      },
    ];

    unit.drainEvents.mockReturnValue(emittedEvents);

    const events = mock<IEventBus>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();

    when(parent.execute).calledWith(mockCommand).thenReject();

    try {
      await bus.execute(mockCommand);
    } catch {
      // NOOP
    }

    expect(events.emit).not.toHaveBeenCalledWith();
    expect(events.emit).not.toHaveBeenCalledWith();
  });
});
