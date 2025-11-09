import { s3ClientToken } from "@tokens";
import type { IObjectStorage } from "@types";
import { S3Client, write } from "bun";
import { inject, injectable } from "inversify";

@injectable()
export class S3BucketObjectStore implements IObjectStorage {
  public constructor(
    @inject(s3ClientToken)
    private client: S3Client,
  ) {}

  public async get(key: string): Promise<object | undefined> {
    const file = this.client.file(key);
    return await file.json();
  }

  public async set(key: string, thing: object): Promise<void> {
    const file = this.client.file(key);
    await write(file, JSON.stringify(thing));
  }
}
