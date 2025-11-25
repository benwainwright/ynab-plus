import { AbstractApplicationService } from "@core";
import type { ContainerModuleLoadOptions } from "inversify";
import { ListScheduledTasksService } from "./list-scheduled-tasks-service.ts";
import { ServiceToken } from "@ports";
import { UpdateScheduledTaskService } from "./update-scheduled-task-service.ts";

export const bind = (load: ContainerModuleLoadOptions) => {
  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(ListScheduledTasksService);

  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(UpdateScheduledTaskService);
};
