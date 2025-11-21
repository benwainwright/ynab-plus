export interface AdapterEvents {
  HttpError: {
    statusCode: number;
    body: string;
  };
}
