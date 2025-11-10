import type { IObjectStorage } from "@application";
import { join } from "node:path";

export class FlatFileObjectStore implements IObjectStorage {
  public constructor(private folder: string) {}

  public async get(key: string): Promise<object | undefined> {
    const path = join(this.folder, key);
    const file = Bun.file(path);
    if (!(await file.exists())) {
      return undefined;
    }
    return await file.json();
  }

  public async set(key: string, thing: object): Promise<void> {
    const path = join(this.folder, key);
    await Bun.write(path, JSON.stringify(thing), { createPath: true });
  }
}
