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

  it("raises a domain event when the passwordHash is modified", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c",
    });

    user.passwordHash = "foo";

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

  it("raises a domain event when the email is modified", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c",
    });

    user.email = "foo";

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
            passwordHash: "hash",
            email: "foo",
          }),
        },
      },
    ]);
  });

  it("raises a domain event when the permissions are modified", () => {
    const user = User.reconstitute({
      permissions: ["public"],
      id: "foo",
      passwordHash: "hash",
      email: "a@b.c",
    });

    user.permissions = ["admin"];

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
            permissions: ["admin"],
            id: "foo",
            passwordHash: "hash",
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
