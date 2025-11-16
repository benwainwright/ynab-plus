import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import type { RegularTask } from "@ynab-plus/domain";

export const useTasks = (offset: number, limit: number) => {
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState<RegularTask[]>([]);

  useEffect(() => {
    startTransition(async () => {
      setTasks(await command("ListScheduledTasksCommand", { offset, limit }));
    });
  }, []);

  return { isPending, tasks };
};
