import { User } from "./user.ts";

describe("the user model", () => {
  describe("freeze dry", () => {
    it("returns an object version of the user without the password hash if secure is false", () => {
      const user = User.reconstitute({
        permissions: ["public"],
        id: "foo",
        passwordHash: "hash",
        email: "a@b.c"
      });

      const dried = user.freezeDry();

      expect(dried).not.toEqual(User);
      expect(dried).toEqual({
        permissions: ["public"],
        id: "foo",
        passwordHash: "",
        email: "a@b.c"
      });
    });

    it("returns an object version of the user with the password hash if secure is true", () => {
      const user = User.reconstitute({
        permissions: ["public"],
        id: "foo",
        passwordHash: "hash",
        email: "a@b.c"
      });

      const dried = user.freezeDry({ secure: true });

      expect(dried).not.toEqual(User);
      expect(dried).toEqual({
        permissions: ["public"],
        id: "foo",
        passwordHash: "hash",
        email: "a@b.c"
      });
    });
  });

  it("raises an a create event when the create model is called", () => {
    const user = User.create({
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c"
    });

    expect(user.pullEvents()).toEqual([
      {
        event: "UserCreated",
        data: user
      }
    ]);
  });

  it("raises a domain event when the user is modified", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c"
    });

    user.update({ hash: "foo" });

    expect(user.pullEvents()).toEqual([
      {
        event: "UserUpdated",
        data: {
          old: User.reconstitute({
            permissions: ["public"],
            id: "foo",
            passwordHash: "hash",
            email: "a@b.c"
          }),
          new: User.reconstitute({
            permissions: ["public"],
            id: "foo",
            passwordHash: "foo",
            email: "a@b.c"
          })
        }
      }
    ]);
  });

  it("raises an a delete event when the create model is called", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c"
    });

    user.delete();

    expect(user.pullEvents()).toEqual([
      {
        event: "UserDeleted",
        data: user
      }
    ]);
  });
});
