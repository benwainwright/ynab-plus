import { describe, it, expect } from "bun:test";
import { canAccess } from "./can-access.ts";
describe("can access", () => {
  it("should return true for public routes", () => {
    const result = canAccess({
      finishedLoading: true,
      user: undefined,
      routeTags: ["public"],
    });

    expect(result).toEqual(true);
  });

  it("should return true if the user has permissions that match", () => {
    const result = canAccess({
      finishedLoading: true,
      user: {
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["admin"],
      },
      routeTags: ["admin"],
    });

    expect(result).toEqual(true);
  });

  it("should return false if the user has no matching permissions", () => {
    const result = canAccess({
      finishedLoading: true,
      user: {
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["user"],
      },
      routeTags: ["admin"],
    });

    expect(result).toEqual(false);
  });

  it("should return false if the user has at leaast one matching permission", () => {
    const result = canAccess({
      finishedLoading: true,
      user: {
        id: "ben",
        email: "bwainwright28@gmail.com",
        passwordHash: "foo",
        permissions: ["user", "admin"],
      },
      routeTags: ["admin"],
    });

    expect(result).toEqual(true);
  });
});
