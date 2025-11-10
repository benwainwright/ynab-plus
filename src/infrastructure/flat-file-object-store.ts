import type { IObjectStorage } from "@application";
import { join } from "node:path";
import type { IConfigurable } from "../i-configurable.ts";
import type { IConfigurator } from "../i-configurator.ts";
import z from "zod";

export class FlatFileObjectStore implements IObjectStorage, IConfigurable {
  private folder: string = "";

  public constructor() {}

  public async configure(configurator: IConfigurator): Promise<void> {
    configurator.getConfig("sessionStorePath", z.string());
  }

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
