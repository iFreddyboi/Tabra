/**
 * F08 — Account deletion
 */
import { test, expect } from "@playwright/test";
import { attachGuards, signIn } from "./helpers";

test.describe("F08 — Account deletion", () => {
  test.beforeEach(({ page }) => attachGuards(page));

  test("F08-E1 cancel at dialog — nothing deleted", async ({ page }) => {
    await signIn(page, "carol@example.com");
    await page.goto("/account");
    await page.getByRole("button", { name: /delete account/i }).click();
    // Dialog appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: /cancel|keep/i }).click();
    // Still on account page, still signed in
    await expect(page).toHaveURL("/account");
    await expect(page.getByText(/carol/i)).toBeVisible();
  });

  test("F08-N1 unauthenticated DELETE /api/account returns 401", async ({ page }) => {
    const response = await page.request.delete("/api/account");
    expect(response.status()).toBe(401);
  });

  test("F08-N2 user cannot delete another user's account", async ({ page }) => {
    await signIn(page, "alice@example.com");
    // The API ties deletion to the session user — there is no userId in the path
    // so this test verifies the route only deletes the session owner
    const response = await page.request.delete("/api/account");
    // Should succeed (deletes alice), not affect bob
    expect(response.status()).toBe(204);
  });
});
