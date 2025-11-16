import { Command } from "./command.ts";
import type { Commands } from "./commands.ts";
import {
  regularTaskSchema,
  type IRegularTask,
  type SchedulableTask,
} from "./i-regular-tasks.ts";

import type { ISerialisable } from "./i-serialisable.ts";

export class RegularTask<TTaskKey extends SchedulableTask = SchedulableTask>
  implements
    IRegularTask<TTaskKey>,
    ISerialisable<IRegularTask<TTaskKey>, "regularTask">
{
  public readonly id: string;
  public readonly onBehalfOf: string;
  public readonly data: string | undefined;
  public readonly lastExecution: Date | undefined;
  public readonly created: Date;
  public readonly minute: string;
  public readonly hour: string;
  public readonly day: string;
  public readonly month: string;
  public readonly weekDay: string;
  public readonly name: string;
  public readonly description: string;
  public readonly command: TTaskKey;

  public constructor(config: IRegularTask<TTaskKey>) {
    this.id = config.id;
    this.created = config.created;
    this.lastExecution = config.lastExecution;
    this.onBehalfOf = config.onBehalfOf;
    this.data = config.data;
    this.minute = config.minute;
    this.hour = config.hour;
    this.day = config.day;
    this.month = config.month;
    this.weekDay = config.weekDay;
    this.name = config.name;
    this.description = config.description;
    this.command = config.command;
  }

  public toObject(): Omit<IRegularTask<TTaskKey>, "toObject"> & {
    $type: "regularTask";
  } {
    return this;
  }

  public getCronString() {
    return `${this.minute} ${this.hour} ${this.day} ${this.month} ${this.weekDay}`;
  }

  public getCommand() {
    return new Command(
      this.command,
      JSON.parse(this.data ?? "{}") as Commands[TTaskKey]["request"],
    );
  }

  public static fromObject(thing: unknown) {
    const data = regularTaskSchema.parse(thing);
    return new RegularTask(data);
  }

  public readonly $type = "regularTask";
}
