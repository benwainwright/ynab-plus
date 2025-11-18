import { Command } from "./command.ts";
import type { Commands } from "./commands.ts";
import {
  regularTaskSchema,
  type IRegularTask,
  type SchedulableTask,
} from "./i-regular-tasks.ts";

import type { ISerialisable } from "./i-serialisable.ts";
import type { SystemContext } from "./system-context.ts";

export class RegularTask<TTaskKey extends SchedulableTask = SchedulableTask>
  implements
    IRegularTask<TTaskKey>,
    ISerialisable<IRegularTask<TTaskKey>, "regularTask">
{
  public readonly id: string;
  public readonly onBehalfOf: string | undefined;
  public readonly data: string | undefined;
  public readonly created: Date;
  public readonly minute: string;
  public readonly hour: string;
  public readonly day: string;
  public readonly month: string;
  public readonly weekDay: string;
  private _name: string;
  private _description: string;
  private _lastExecution: Date | undefined;
  public readonly command: TTaskKey;

  public constructor(config: IRegularTask<TTaskKey>) {
    this.id = config.id;
    this.created = config.created;
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

  public toObject(): Omit<IRegularTask<TTaskKey>, "toObject"> & {
    $type: "regularTask";
  } {
    return {
      $type: "regularTask",
      id: this.id,
      created: this.created,
      lastExecution: this.lastExecution,
      onBehalfOf: this.onBehalfOf,
      data: this.data,
      minute: this.minute,
      hour: this.hour,
      day: this.day,
      month: this.month,
      weekDay: this.weekDay,
      name: this.name,
      description: this.description,
      command: this.command,
    };
  }

  public get name(): string {
    return this._name;
  }

  public set name(name: string) {
    this._name = name;
  }

  public get lastExecution(): Date | undefined {
    return this._lastExecution;
  }

  public set lastExecution(lastExecution: Date | undefined) {
    this._lastExecution = lastExecution;
  }

  public get description(): string {
    return this._description;
  }

  public set description(description: string) {
    this._description = description;
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

  public static fromObject(thing: unknown) {
    const data = regularTaskSchema.parse(thing);
    return new RegularTask(data);
  }

  public readonly $type = "regularTask";
}
