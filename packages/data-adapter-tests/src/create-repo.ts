import { TypedContainer, type TypedContainerModule } from "@inversifyjs/strongly-typed";
import { mock } from "vitest-mock-extended";
import type { IDataPorts, IDomainEventBuffer, IUnitOfWork } from "@ynab-plus/app";
import type { Mocked } from "vitest";
import { type ILogger, type BootstrapTypes, type IBootstrapper } from "@ynab-plus/bootstrap";

type DataPortsWithMock = IDataPorts & {
  DomainEventBuffer: Mocked<IDomainEventBuffer>;
};

export const createRepo = async <TKey extends keyof DataPortsWithMock>(
  repoKey: TKey,
  ...modules: TypedContainerModule<DataPortsWithMock>[]
): Promise<{
  repo: DataPortsWithMock[TKey];
  unitOfWork: IUnitOfWork;
  eventBuffer: Mocked<IDomainEventBuffer>;
}> => {
  const container = new TypedContainer<DataPortsWithMock & BootstrapTypes>();
  const bootstrapper = mock<IBootstrapper>();
  const logger = mock<ILogger>();
  container.bind("Bootstrapper").toConstantValue(bootstrapper);
  container.bind("Logger").toConstantValue(logger);
  container.bind("Container").toConstantValue(container);
  const mockEventBuffer = mock<IDomainEventBuffer>();
  container.bind("DomainEventBuffer").toConstantValue(mockEventBuffer);

  for (const module of modules) {
    await container.load(module);
  }

  container.get("Bootstrapper");

  return {
    repo: (await container.getAsync(repoKey)) as DataPortsWithMock[TKey],
    unitOfWork: await container.getAsync("UnitOfWork"),
    eventBuffer: mockEventBuffer
  };
};
