import { flatFileFolderToken } from "@tokens";
import type { ISimpleStorage } from "@types";
import { inject, injectable } from "inversify";
import { join } from "node:path";

@injectable()
export class FlatFileStorage implements ISimpleStorage {
  public constructor(
    @inject(flatFileFolderToken)
    private folder: string,
  ) {}
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
