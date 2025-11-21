import type { RegularTask } from "./regular-task.ts";

export interface RegularTaskEvents {
  RegularTaskCreated: RegularTask;
  RegularTaskDeleted: RegularTask;
  RegularTaskUpdated: { old: RegularTask; new: RegularTask };
}
