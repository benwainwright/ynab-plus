import { Command } from "../command.ts";

import type { Commands } from "../commands.ts";
import {
  regularTaskSchema,
  type IRegularTask,
  type SchedulableTask,
} from "./i-regular-tasks.ts";

import { DomainModel, type SystemContext } from "@core";

export class RegularTask<
  TTaskKey extends SchedulableTask = SchedulableTask,
> extends DomainModel<IRegularTask<SchedulableTask>> {
  public override freezeDry(_config?: {
    secure: boolean;
  }): IRegularTask<SchedulableTask> {
    return {
      id: this.id,
      onBehalfOf: this.onBehalfOf,
      created: this.created,
      minute: this.minute,
      hour: this.hour,
      day: this.day,
      month: this.month,
      triggerImmediately: this.triggerImmediately,
      weekDay: this.weekDay,
      name: this.name,
      description: this.description,
      lastExecution: this.lastExecution,
      command: this.command,
      data: this.data,
    };
  }

  public readonly id: string;
  public readonly onBehalfOf: string | undefined;
  public readonly data: string | undefined;
  public readonly created: Date;
  public readonly minute: string;
  public readonly hour: string;
  public readonly day: string;
  public readonly triggerImmediately: boolean;
  public readonly month: string;
  public readonly weekDay: string;
  private _name: string;
  private _description: string;
  private _lastExecution: Date | undefined;
  public readonly command: TTaskKey;

  private constructor(config: IRegularTask<TTaskKey>) {
    super();
    this.id = config.id;
    this.created = config.created;
    this.triggerImmediately = config.triggerImmediately;
    this._lastExecution = config.lastExecution;
    this.onBehalfOf = config.onBehalfOf;
    this.data = config.data;
    this.minute = config.minute;
    this.hour = config.hour;
    this.day = config.day;
    this.month = config.month;
    this.weekDay = config.weekDay;
    this._name = config.name;
    this._description = config.description;
    this.command = config.command;
  }

  public static reconstitute<TTaskKey extends SchedulableTask>(
    config: IRegularTask<TTaskKey>,
  ) {
    return new RegularTask(regularTaskSchema.parse(config));
  }

  public static create<TTaskKey extends SchedulableTask>(
    config: Omit<IRegularTask<TTaskKey>, "created">,
  ) {
    const theTask = new RegularTask({ ...config, created: new Date() });
    theTask.raiseEvent({ event: "RegularTaskCreated", data: theTask });
    return theTask;
  }

  public updateTask(config: {
    name?: string;
    description?: string;
    lastExecution?: Date;
  }) {
    const old = RegularTask.reconstitute(this);
    this._name = config.name ?? this._name;
    this._description = config.description ?? this._description;
    this._lastExecution = config.lastExecution ?? this._lastExecution;
    this.raiseEvent({ event: "RegularTaskUpdated", data: { old, new: this } });
  }

  public delete() {
    this.raiseEvent({ event: "RegularTaskDeleted", data: this });
  }

  public get name(): string {
    return this._name;
  }

  public get lastExecution(): Date | undefined {
    return this._lastExecution;
  }

  public get description(): string {
    return this._description;
  }

  public executionDetailsAreEqual(other: RegularTask | undefined) {
    if (!other) {
      return false;
    }

    if (other === this) {
      return true;
    }

    return (
      this.data === other.data &&
      this.onBehalfOf === other.onBehalfOf &&
      this.minute === other.minute &&
      this.hour === other.hour &&
      this.day === other.day &&
      this.month === other.month &&
      this.command === other.command
    );
  }

  public getCronString() {
    return `${this.minute} ${this.hour} ${this.day} ${this.month} ${this.weekDay}`;
  }

  public getCommand(role: SystemContext) {
    return new Command(
      this.command,
      JSON.parse(this.data ?? "{}") as Commands[TTaskKey]["request"],
      role,
    );
  }
}
