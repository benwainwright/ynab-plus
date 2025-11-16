import {
  regularTaskSchema,
  type IRegularTask,
  type SchedulableTask,
} from "./i-regular-tasks.ts";

import type { ISerialisable } from "./i-serialisable.ts";

export class RegularTask
  implements IRegularTask, ISerialisable<IRegularTask, "regularTask">
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
  public readonly command: SchedulableTask;

  public constructor(config: IRegularTask) {
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

  public toObject(): Omit<IRegularTask, "toObject"> & { $type: "regularTask" } {
    return this;
  }

  public static fromObject(thing: unknown) {
    const data = regularTaskSchema.parse(thing);
    return new RegularTask(data);
  }

  public readonly $type = "regularTask";
}
