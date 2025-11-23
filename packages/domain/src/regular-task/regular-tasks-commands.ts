import type { RegularTask } from "./regular-task.ts";

export interface RegularTasksCommands {
  ListScheduledTasksCommand: {
    request: {
      offset: number;
      limit: number | undefined;
    };
    response: RegularTask[];
  };
  UpdateScheduledTaskCommand: {
    request: RegularTask;
    response: { success: boolean };
  };
  DeleteScheduledTaskCommand: {
    request: {
      id: string;
    };
    response: undefined;
  };
}
