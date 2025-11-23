import { User } from "./user.ts";

describe("the user model", () => {
  it("raises an a create event when the create model is called", () => {
    const user = User.create({
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c",
    });

    expect(user.pullEvents()).toEqual([
      {
        event: "UserCreated",
        data: user,
      },
    ]);
  });

  it("raises a domain event when the user is modified", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c",
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
            email: "a@b.c",
          }),
          new: User.reconstitute({
            permissions: ["public"],
            id: "foo",
            passwordHash: "foo",
            email: "a@b.c",
          }),
        },
      },
    ]);
  });

  it("raises an a delete event when the create model is called", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c",
    });

    user.delete();

    expect(user.pullEvents()).toEqual([
      {
        event: "UserDeleted",
        data: user,
      },
    ]);
  });
});
