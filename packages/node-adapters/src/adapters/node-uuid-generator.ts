import type { IUUIDGenerator } from "@ynab-plus/app";
import { v7 } from "uuid";

export class NodeUUIDGenerator implements IUUIDGenerator {
  public getUUID(): string {
    return v7();
  }
}
