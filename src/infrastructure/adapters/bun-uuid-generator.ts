import type { IUUIDGenerator } from "@application";

export class BunUUIDGenerator implements IUUIDGenerator {
  public getUUID(): string {
    return Bun.randomUUIDv7();
  }
}
