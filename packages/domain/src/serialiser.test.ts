import { serialiseObject } from "./serialiser.ts";
import { User } from "./user.ts";

describe("serialiser", () => {
  it("correctly serialises nested objects", () => {
    const data = new User({
      email: "bwainwright28@gmail.com",
      id: "ben",
      passwordHash:
        "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
      permissions: ["user", "public"],
    });

    const foo = {
      bar: {
        baz: "bap",
      },
      bip: {
        bing: data,
      },
    };

    const result = serialiseObject(foo);

    if (
      typeof result === "object" &&
      result &&
      "bip" in result &&
      typeof result.bip === "object" &&
      result.bip &&
      "bing" in result.bip
    ) {
      expect(result.bip.bing).not.toBeInstanceOf(User);
    }
  });
});
