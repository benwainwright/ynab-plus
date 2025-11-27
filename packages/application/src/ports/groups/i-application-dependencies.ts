import type { AbstractApplicationService } from "@core";
import type { IDataPorts } from "./i-data-ports.ts";
import type { IIntegrationPorts } from "./i-integration-ports.ts";
import type { IRuntimePorts } from "./i-runtime-ports.ts";
import type { IEntrypointPorts } from "./i-entrypoint-ports.ts";

export type IApplicationDependencies = IEntrypointPorts &
  IRuntimePorts &
  IDataPorts &
  IIntegrationPorts & {
    Service: AbstractApplicationService;
  };
