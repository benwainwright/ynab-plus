import { Loader, Page } from "@components";
import { useTasks } from "@data";
import { Table } from "@mantine/core";
import cronstrue from "cronstrue";
import RelativeTime from "@yaireo/relative-time";

export const Tasks = () => {
  const { tasks, isPending } = useTasks(0, 30);
  const relativeTime = new RelativeTime();
  return (
    <Page routeName="tasks">
      <Loader isPending={isPending} data={tasks}>
        {(data) => (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Command</Table.Th>
                <Table.Th>Frequency</Table.Th>
                <Table.Th>Data</Table.Th>
                <Table.Th>Last Ran</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <tbody>
              {data.map((task) => {
                const cron = cronstrue.toString(
                  `${task.minute} ${task.hour} ${task.day} ${task.month} ${task.weekDay}`,
                );
                return (
                  <Table.Tr key={`${task.id}-user-row`}>
                    <Table.Td>{task.onBehalfOf}</Table.Td>
                    <Table.Td>{task.name}</Table.Td>
                    <Table.Td>{task.command}</Table.Td>
                    <Table.Td>{cron}</Table.Td>
                    <Table.Td>{task.data}</Table.Td>
                    <Table.Td>
                      {task.lastExecution
                        ? relativeTime.from(task.lastExecution)
                        : "None"}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Loader>
    </Page>
  );
};

export default Tasks;
