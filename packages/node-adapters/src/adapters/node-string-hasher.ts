import { createHash } from "crypto";
import type { IStringHasher } from "@ynab-plus/app";
import { injectable } from "inversify";

@injectable()
export class NodeStringHasher implements IStringHasher {
  public md5(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }
}
