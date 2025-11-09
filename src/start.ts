import "reflect-metadata";
import { container } from "./container.ts";
import { AppServer } from "@core";

const rootInstance = container.get(AppServer);

rootInstance.start();
