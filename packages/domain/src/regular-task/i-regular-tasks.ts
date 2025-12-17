import z from "zod";
import type { Commands } from "../commands.ts";

const schedulableTasks = [
  "SyncAccountsCommand",
  "SyncAccountCommand",
  "CheckOauthIntegrationStatusCommand"
] as const satisfies Readonly<(keyof Commands)[]>;

export const schedulableTasksSchema = z.union(schedulableTasks.map((task) => z.literal(task)));

export type SchedulableTask = z.output<typeof schedulableTasksSchema>;

export const regularTaskSchema = z.object({
  id: z.string(),
  onBehalfOf: z.string().optional(),
  created: z
    .union([z.string(), z.date()])
    .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg)),

  lastExecution: z.union([
    z
      .union([z.string(), z.date()])
      .transform((arg) => (typeof arg === "string" ? new Date(arg) : arg)),
    z.undefined()
  ]),
  minute: z.string(),
  data: z.union([z.string(), z.undefined()]),
  hour: z.string(),
  triggerImmediately: z.boolean(),
  day: z.string(),
  month: z.string(),
  weekDay: z.string(),
  name: z.string(),
  description: z.string(),
  command: schedulableTasksSchema
});

export type IRegularTask<TTaskKey extends SchedulableTask> = z.output<typeof regularTaskSchema> & {
  command: TTaskKey;
};
