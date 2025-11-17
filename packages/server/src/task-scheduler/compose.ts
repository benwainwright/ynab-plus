import type { IApplicationLayer } from "@ynab-plus/app";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import { TaskScheduler } from "./task-scheduler.ts";

interface ITaskSchedulerDependencies {
  application: IApplicationLayer;
  bootstrapper: IBootstrapper;
  logger: ILogger;
}

export const compose = async ({
  application,
  bootstrapper,
  logger,
}: ITaskSchedulerDependencies) => {
  const { serviceBus, eventBus } = await application.withSingletonServiceBus();

  const taskScheduler = new TaskScheduler(serviceBus, eventBus, logger);

  bootstrapper.addInitStep(async () => {
    await taskScheduler.initialise();
  });
};
