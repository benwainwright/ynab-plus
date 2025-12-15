import { HttpError } from "@errors";
import type { ILogger } from "@ynab-plus/bootstrap";
import type z4 from "zod/v4";
import type { IResponseCache } from "./i-response-cache.ts";

const LOG_CONTEXT = { context: "http-client" };

interface IRequestConfig<TResponse extends z4.ZodType> {
  ttl?: number | undefined;
  path: string;
  method: "get" | "post";
  body?: Record<string, string>;
  queryString: Record<string, string> | undefined;
  headers: Record<string, string> | undefined;
  responseSchema: TResponse;
}

interface HttpClientConfig {
  baseUrl: string;
  logger: ILogger;
  responseCache: IResponseCache<unknown>;
  defaultHeaders?: Record<string, string>;
  defaultTtl?: number;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly logger: ILogger;
  private readonly cache: IResponseCache<unknown>;
  private readonly defaultHeaders: Record<string, string> | undefined;
  private readonly defaultTtl: number | undefined;

  public constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.logger = config.logger;
    this.cache = config.responseCache;
    this.defaultHeaders = config.defaultHeaders;
    this.defaultTtl = config.defaultTtl;
  }

  public async get<TResponse extends z4.ZodType>({
    path,
    responseSchema,
    headers,
    queryString,
    ttl,
  }: {
    path: string;
    responseSchema: TResponse;
    headers?: Record<string, string>;
    queryString?: Record<string, string>;
    ttl?: number | undefined;
  }): Promise<z4.output<TResponse>> {
    return await this.request({
      path,
      ttl,
      responseSchema,
      headers,
      method: "get",
      queryString,
    });
  }

  public async post<TResponse extends z4.ZodType>({
    path,
    body,
    responseSchema,
    headers,
    queryString,
  }: {
    path: string;
    body: Record<string, string>;
    responseSchema: TResponse;
    headers?: Record<string, string>;
    queryString?: Record<string, string>;
  }): Promise<z4.output<TResponse>> {
    return await this.request<TResponse>({
      queryString,
      headers,
      path,
      responseSchema,
      method: "post",
      body,
    });
  }

  private async doCachedFetch(url: string, init: RequestInit, ttl: number | undefined) {
    const cacheKey = `${url}-${String(init.method)}-${JSON.stringify(init.body)}`;

    const cacheResult = this.cache.get(cacheKey);

    if (cacheResult !== undefined) {
      return cacheResult;
    }

    const result = await fetch(url, init);

    if (!result.ok) {
      const text = await result.text();
      const urlObj = {
        url,
        ...init,
      };
      throw new HttpError(`Request ${JSON.stringify(urlObj)} failed: ${text}`, result.status, text);
    }

    const data = (await result.json()) as unknown;

    const finalTtl = ttl ?? this.defaultTtl;

    if (finalTtl) {
      this.cache.set(cacheKey, data, finalTtl);
    }

    return data;
  }

  private buildUrl(baseUrl: string, path: string, queryString?: Record<string, string>) {
    const baseUrlFinal = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const pathFinal = path.startsWith("/") ? path : `/${path}`;

    if (queryString && Object.entries(queryString).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryString).forEach(([key, value]) => {
        params.set(key, value);
      });
      return `${baseUrlFinal}${pathFinal}?${params.toString()}`;
    }

    return `${baseUrlFinal}${pathFinal}`;
  }

  public async request<TResponse extends z4.ZodType>({
    path,
    method,
    responseSchema,
    body,
    headers,
    queryString,
    ttl,
  }: IRequestConfig<TResponse>): Promise<z4.output<TResponse>> {
    const url = this.buildUrl(this.baseUrl, path, queryString);

    const withDefaultHeaders = this.defaultHeaders ? { headers: this.defaultHeaders } : {};

    const withHeaders = headers
      ? { headers: { ...withDefaultHeaders.headers, ...headers } }
      : withDefaultHeaders;

    const withBody = body ? { body: JSON.stringify(body) } : {};

    const config: RequestInit = {
      ...withBody,
      ...withHeaders,
      method,
    };

    this.logger.silly(`Sending request to ${url} with ${JSON.stringify(config)}`, LOG_CONTEXT);

    const data = await this.doCachedFetch(url, config, ttl);

    this.logger.silly(JSON.stringify(data, null, 2), LOG_CONTEXT);

    return responseSchema.parse(data);
  }
}
