import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import type { IObjectStorage } from "@ynab-plus/app";
import type { ConfigValue, ILogger } from "@ynab-plus/bootstrap";

export const LOG_CONTEXT = { context: "flat-file-object-store" };

export class FlatFileObjectStore<TObject extends object>
  implements IObjectStorage<TObject>
{
  public constructor(
    private folder: ConfigValue<string>,
    private logger: ILogger,
  ) {}

  private async resolvePath(key: string) {
    const base = await this.folder.value;
    return join(cwd(), base, key);
  }

  public async get(key: string): Promise<TObject | undefined> {
    const path = await this.resolvePath(key);
    this.logger.silly(`Path resolved at ${path}`, LOG_CONTEXT);

    try {
      const fileStat = await stat(path);
      const isFile = fileStat.isFile();

      this.logger.silly(
        `Path is a file? ${isFile ? "yes" : "no"}`,
        LOG_CONTEXT,
      );

      if (!fileStat.isFile()) return undefined;

      const raw = await readFile(path, "utf8");
      return JSON.parse(raw) as TObject;
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "ENOENT"
      ) {
        return undefined;
      }
      throw err;
    }
  }

  public async set(key: string, thing: TObject | undefined): Promise<void> {
    const path = await this.resolvePath(key);
    const dir = path.substring(0, path.lastIndexOf("/"));

    await mkdir(dir, { recursive: true });

    this.logger.silly(
      `Storing ${JSON.stringify(thing)} in ${path}`,
      LOG_CONTEXT,
    );

    if (typeof thing === "undefined") {
      await rm(path);
    } else {
      await writeFile(path, JSON.stringify(thing));
    }
  }
}
