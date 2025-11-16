import type { IRegularTask } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";

export const useTasks = (offset: number, limit: number) => {
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState<IRegularTask[]>([]);

  useEffect(() => {
    startTransition(async () => {
      setTasks(await command("ListScheduledTasksCommand", { offset, limit }));
    });
  }, []);

  return { isPending, tasks };
};
