import { inject } from "@core";
import type { IObjectStorage } from "@ynab-plus/app";
import type { IResponseCache } from "./i-response-cache.ts";

export const NAMESPACE = "http-response-cache";

export class ObjectStorageResponseCache implements IResponseCache<unknown> {
  public constructor(
    @inject("ObjectStore")
    private storage: IObjectStorage,
  ) {}

  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const data = {
      expires: typeof ttl !== "undefined" ? new Date(Date.now() + ttl).toISOString() : undefined,
      data: value,
    };

    await this.storage.set(NAMESPACE, key, JSON.stringify(data));
  }

  public async get(key: string): Promise<unknown> {
    const data = await this.storage.get(NAMESPACE, key);
    if (data === undefined) {
      return undefined;
    }

    const parsed = JSON.parse(data) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    if ("expires" in parsed && typeof parsed.expires === "string") {
      const expiry = new Date(parsed.expires);
      if (new Date() > expiry) {
        await this.delete(key);
        return undefined;
      }
    }

    return "data" in parsed && parsed.data;
  }

  public async delete(key: string): Promise<void> {
    await this.storage.set(NAMESPACE, key, undefined);
  }

  public async clear(): Promise<void> {
    await this.storage.clear(NAMESPACE);
  }
}
