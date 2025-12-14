import { type IDomainEventStore, type IServiceBus, type IUnitOfWork } from "@ports";
import { mock } from "vitest-mock-extended";
import { TransactionalServiceBus } from "./transactional-service-bus.ts";
import { type ILogger } from "@ynab-plus/bootstrap";
import { Command, type Commands } from "@ynab-plus/domain";
import { when } from "vitest-when";

describe("transactional service bus", () => {
  it("passes the command to the parent service bus and executes it", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    const logger = mock<ILogger>();
    const domainEventEmitter = mock<IDomainEventStore>();

    const bus = new TransactionalServiceBus(parent, unit, domainEventEmitter, logger);

    const mockCommand = mock<Command>();
    const mockResult = mock<Commands[keyof Commands]["response"]>();

    when(parent.execute).calledWith(mockCommand).thenResolve(mockResult);

    const result = await bus.execute(mockCommand);

    expect(result).toEqual(mockResult);
  });

  it("wraps command execution with begin and commit", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    const logger = mock<ILogger>();
    const domainEventEmitter = mock<IDomainEventStore>();

    const bus = new TransactionalServiceBus(parent, unit, domainEventEmitter, logger);

    const mockCommand = mock<Command>();
    const mockResult = mock<Commands[keyof Commands]["response"]>();

    when(parent.execute).calledWith(mockCommand).thenResolve(mockResult);

    await bus.execute(mockCommand);

    expect(unit.begin).toHaveBeenCalledBefore(parent.execute);
    expect(unit.commit).toHaveBeenCalledAfter(parent.execute);
    expect(domainEventEmitter.flush).toHaveBeenCalled();
  });

  it("calls rollback and rethrows error if there is an error in commit", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    const logger = mock<ILogger>();

    const domainEventEmitter = mock<IDomainEventStore>();

    const bus = new TransactionalServiceBus(parent, unit, domainEventEmitter, logger);

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

    const events = mock<IDomainEventStore>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();

    when(parent.execute).calledWith(mockCommand).thenReject(new Error());

    await expect(bus.execute(mockCommand)).rejects.toThrow();

    expect(unit.rollback).toHaveBeenCalled();
  });

  it("does not emit events if there is an error", async () => {
    const parent = mock<IServiceBus>();
    const unit = mock<IUnitOfWork>();

    const events = mock<IDomainEventStore>();
    const logger = mock<ILogger>();

    const bus = new TransactionalServiceBus(parent, unit, events, logger);

    const mockCommand = mock<Command>();

    when(parent.execute).calledWith(mockCommand).thenReject();

    try {
      await bus.execute(mockCommand);
    } catch {
      // NOOP
    }

    expect(events.flush).not.toHaveBeenCalledWith();
    expect(events.purge).toHaveBeenCalledWith();
  });
});
