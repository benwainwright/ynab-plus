import { User, type IUser } from "@ynab-plus/domain";
import { Typeson } from "typeson";

export class Serialiser {
  private registry = new Typeson();

  public constructor() {
    this.registry.register({
      user: [
        (thing) => thing instanceof User,
        (user: User): IUser => ({
          id: user.id,
          permissions: user.permissions,
          email: user.email,
          passwordHash: user.passwordHash,
        }),
        (raw: IUser) => User.reconstitute(raw),
      ],
    });
  }

  public async serialise(thing: unknown): Promise<string> {
    return await this.registry.stringify(thing);
  }

  public async deserialise(data: string): Promise<unknown> {
    return await this.registry.parse(data);
  }
}
