import type { IObjectStorage } from "@ynab-plus/app";
import { S3Client, write } from "bun";
import z4, { $ZodType } from "zod/v4/core";

export class S3BucketObjectStore<TObject extends object>
  implements IObjectStorage<TObject>
{
  public constructor(
    private client: S3Client,
    private schema: $ZodType<TObject>,
  ) {}

  public async get(key: string): Promise<TObject | undefined> {
    const file = this.client.file(key);

    // Reads typically need to be faster than writes. Data is
    // validated on the way in, so should be safe
    return (await file.json()) as TObject;
  }

  public async set(key: string, thing: TObject): Promise<void> {
    const data = z4.parse(this.schema, thing);
    const file = this.client.file(key);
    await write(file, JSON.stringify(data));
  }
}
