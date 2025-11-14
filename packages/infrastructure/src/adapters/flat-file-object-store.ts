import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { IObjectStorage } from "@ynab-plus/app";
import type { ConfigValue, ILogger } from "@ynab-plus/bootstrap";

export const LOG_CONTEXT = { context: "flat-file-object-store" };

export class FlatFileObjectStore implements IObjectStorage {
  public constructor(
    private folder: ConfigValue<string>,
    private logger: ILogger,
  ) {}

  private async resolvePath(key: string) {
    const base = await this.folder.value;
    return join(base, key);
  }

  public async get(key: string): Promise<object | undefined> {
    const path = await this.resolvePath(key);

    try {
      const fileStat = await stat(path);
      if (!fileStat.isFile()) return undefined;

      const raw = await readFile(path, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "ENOENT"
      )
        return undefined;
      throw err;
    }
  }

  public async set(key: string, thing: object): Promise<void> {
    const path = await this.resolvePath(key);
    const dir = path.substring(0, path.lastIndexOf("/"));

    await mkdir(dir, { recursive: true });

    this.logger.silly(
      `Storing ${JSON.stringify(thing)} in ${path}`,
      LOG_CONTEXT,
    );

    await writeFile(path, JSON.stringify(thing));
  }
}
