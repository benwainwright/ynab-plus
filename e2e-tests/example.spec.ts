import { test, expect } from "@playwright/test";

test("Register link", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Register" }).click();

  await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
});
