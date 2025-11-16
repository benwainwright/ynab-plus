import { buildApplication } from "@core";

const application = buildApplication({
  name: "Task Scheduler",
  configFile: "ynab-plus.config.task-scheduler-json",
});

await application.start();
