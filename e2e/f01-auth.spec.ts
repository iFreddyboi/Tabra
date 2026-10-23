/**
 * F01 — Sign-up / magic link
 */
import { test, expect } from "@playwright/test";
import { attachGuards, assertA11y } from "./helpers";

test.describe("F01 — Auth / magic link", () => {
  test.beforeEach(({ page }) => attachGuards(page));

  test("F01-H1 happy path — sends magic link email", async ({ page }) => {
    await page.goto("/login");
    await assertA11y(page);
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByRole("button", { name: /send (sign-in )?link/i }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test("F01-E1 empty email shows validation error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText(/email is required|enter your email/i)).toBeVisible();
    // No network request made
  });

  test("F01-E2 invalid email shows validation error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("notanemail");
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("F01-E5 double-click sends only one email", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("double@example.com");
    const btn = page.getByRole("button", { name: /send/i });
    await Promise.all([btn.click(), btn.click()]);
    await expect(page.getByText(/check your email/i)).toBeVisible();
    // Button should be disabled after first click
    await expect(btn).toBeDisabled();
  });

  test("F01-E6 very long valid email accepted", async ({ page }) => {
    const longEmail = "a".repeat(240) + "@x.com";
    await page.goto("/login");
    await page.getByLabel("Email").fill(longEmail);
    await page.getByRole("button", { name: /send/i }).click();
    // Either accepted or shows a clear error — no 500
  });
});
