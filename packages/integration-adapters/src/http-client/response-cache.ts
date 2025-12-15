import { injectable } from "inversify";
import type { IResponseCache } from "./i-response-cache.ts";

@injectable()
export class ResponseCache<T> implements IResponseCache<T> {
  private data = new Map<string, { data: T; timeout: NodeJS.Timeout | undefined }>();

  public delete(key: string) {
    this.data.delete(key);
  }

  public clear() {
    this.data.clear();
  }

  public set(key: string, thing: T, ttl?: number) {
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

  public get(key: string) {
    const result = this.data.get(key);

    if (!result) {
      return undefined;
    }

    return result.data;
  }
}
