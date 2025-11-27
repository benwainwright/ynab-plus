import { inject as inversifyInject } from "inversify";
import type { TypedInject } from "@inversifyjs/strongly-typed";
import type { IIntegrationPorts } from "@ports/groups";

export const $inject = inversifyInject as TypedInject<IIntegrationPorts>;
