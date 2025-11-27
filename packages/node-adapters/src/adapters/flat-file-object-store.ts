import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import type { IObjectStorage } from "@ynab-plus/app";
import {
  LoggerToken,
  type ConfigValue,
  type ILogger,
} from "@ynab-plus/bootstrap";
import { inject, injectable, type ServiceIdentifier } from "inversify";

export const LOG_CONTEXT = { context: "flat-file-object-store" };

export const FlatFileObjectStoreFolderToken: ServiceIdentifier<
  ConfigValue<string>
> = Symbol.for("FlatFileObjectStoreFolderToken");

@injectable()
export class FlatFileObjectStore implements IObjectStorage {
  public constructor(
    @inject(FlatFileObjectStoreFolderToken)
    private folder: ConfigValue<string>,
    @inject(LoggerToken)
    private logger: ILogger,
  ) {}

  private async resolvePath(key: string) {
    const base = await this.folder.value;
    return join(cwd(), base, key);
  }

  public async get(key: string): Promise<string | undefined> {
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

      return await readFile(path, "utf8");
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

  public async set(key: string, thing: string | undefined): Promise<void> {
    const path = await this.resolvePath(key);
    const dir = path.substring(0, path.lastIndexOf("/"));

    await mkdir(dir, { recursive: true });

    this.logger.silly(`Storing ${String(thing)} in ${path}`, LOG_CONTEXT);

    if (typeof thing === "undefined") {
      await rm(path, { force: true });
    } else {
      await writeFile(path, thing);
    }
  }
}
