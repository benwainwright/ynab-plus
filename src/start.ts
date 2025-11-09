import "reflect-metadata";
import { container } from "./container.ts";
import { AppServer } from "@core";

const rootInstance = container.get(AppServer);

const server = rootInstance.start();

console.log(`Running server on ${server.url}`);
