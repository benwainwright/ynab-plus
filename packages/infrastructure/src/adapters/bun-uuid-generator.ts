import type { IUUIDGenerator } from "@ynab-plus/app";

export class BunUUIDGenerator implements IUUIDGenerator {
  public getUUID(): string {
    return Bun.randomUUIDv7();
  }
}
