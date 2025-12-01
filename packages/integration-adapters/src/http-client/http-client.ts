import { HttpError } from "@errors";
import type { ILogger } from "@ynab-plus/bootstrap";
import type z4 from "zod/v4";

const LOG_CONTEXT = { context: "http-client" };

interface IRequestConfig<TResponse extends z4.ZodType> {
  path: string;
  method: "get" | "post";
  body?: Record<string, string>;
  queryString: Record<string, string> | undefined;
  headers: Record<string, string> | undefined;
  responseSchema: TResponse;
}

export class HttpClient {
  public constructor(
    private baseUrl: string,
    private logger: ILogger,
    private defaultHeaders?: Record<string, string>,
  ) {}

  public async get<TResponse extends z4.ZodType>({
    path,
    responseSchema,
    headers,
    queryString,
  }: {
    path: string;
    responseSchema: TResponse;
    headers?: Record<string, string>;
    queryString?: Record<string, string>;
  }): Promise<z4.output<TResponse>> {
    return await this.request({
      path,
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

  private buildUrl(
    baseUrl: string,
    path: string,
    queryString?: Record<string, string>,
  ) {
    const baseUrlFinal = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const pathFinal = path.startsWith("/") ? path : `/${path}`;

    if (queryString) {
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
  }: IRequestConfig<TResponse>): Promise<z4.output<TResponse>> {
    const url = this.buildUrl(this.baseUrl, path, queryString);

    const withDefaultHeaders = this.defaultHeaders
      ? { headers: this.defaultHeaders }
      : {};

    const withHeaders = headers
      ? { headers: { ...withDefaultHeaders.headers, ...headers } }
      : withDefaultHeaders;

    const withBody = body ? { body: JSON.stringify(body) } : {};

    const config: RequestInit = {
      ...withBody,
      ...withHeaders,
      method,
    };

    this.logger.silly(
      `Sending request to ${url} with ${JSON.stringify(config)}`,
      LOG_CONTEXT,
    );

    const result = await fetch(url, config);

    if (!result.ok) {
      const text = await result.text();
      const urlObj = {
        url,
        ...config,
      };
      throw new HttpError(
        `Request ${JSON.stringify(urlObj)} failed: ${text}`,
        result.status,
        text,
      );
    }

    const data = (await result.json()) as unknown;

    this.logger.silly(JSON.stringify(data, null, 2), LOG_CONTEXT);

    return responseSchema.parse(data);
  }
}
