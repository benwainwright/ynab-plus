import { setupServer } from "msw/node";
import { handlers as ynabHandlers } from "./handlers/ynab/handlers.ts";
import { handlers as goCardlessHandlers } from "./handlers/gocardless/handlers.ts";

export const server = setupServer(...[...ynabHandlers, ...goCardlessHandlers]);
