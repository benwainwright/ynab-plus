import { injectable } from "inversify";
import type { IResponseCache } from "./i-response-cache.ts";
import type { ILogger } from "@ynab-plus/bootstrap";
import { inject } from "@ynab-plus/app";

const LOG_CONTEXT = { context: "response-cache" };

@injectable()
export class InMemoryResponseCache<T> implements IResponseCache<T> {
  public constructor(
    @inject("Logger")
    private readonly logger: ILogger,
  ) {}

  private data = new Map<string, { data: T; timeout: NodeJS.Timeout | undefined }>();

  // oxlint-disable eslint/require-await
  public async delete(key: string) {
    this.data.delete(key);
  }

  // oxlint-disable eslint/require-await
  public async clear() {
    this.data.clear();
  }

  // oxlint-disable eslint/require-await
  public async set(key: string, thing: T, ttl?: number) {
    this.logger.silly(`Caching value for key'${key}'`, LOG_CONTEXT);
    const existing = this.data.get(key);

    if (existing) {
      clearTimeout(existing.timeout);
    }

    const timeout =
      typeof ttl !== "undefined"
        ? setTimeout(() => {
            this.data.delete(key);
          }, ttl)
        : undefined;

    this.data.set(key, { data: thing, timeout });
  }

  // oxlint-disable eslint/require-await
  public async get(key: string) {
    const result = this.data.get(key);

    if (!result) {
      return undefined;
    }

    this.logger.silly(`Cache hit for key '${key}'`, LOG_CONTEXT);

    return result.data;
  }
}
