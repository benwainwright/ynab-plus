import type { IObjectStorage } from "@application";
import { join } from "node:path";
import type { IConfigValue } from "../i-config-value.ts";

export class FlatFileObjectStore implements IObjectStorage {
  public constructor(private folder: IConfigValue<string>) {}

  public async get(key: string): Promise<object | undefined> {
    const path = join(await this.folder.value, key);
    const file = Bun.file(path);
    if (!(await file.exists())) {
      return undefined;
    }
    return await file.json();
  }

  public async set(key: string, thing: object): Promise<void> {
    const path = join(await this.folder.value, key);
    await Bun.write(path, JSON.stringify(thing), { createPath: true });
  }
}
