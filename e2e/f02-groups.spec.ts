/**
 * F02 — Create group
 */
import { test, expect } from "@playwright/test";
import { attachGuards, assertA11y, signIn } from "./helpers";

test.describe("F02 — Create group", () => {
  test.beforeEach(async ({ page }) => {
    attachGuards(page);
    await signIn(page, "alice@example.com");
  });

  test("F02-H1 happy path — creates group and redirects", async ({ page }) => {
    await page.goto("/groups/new");
    await assertA11y(page);
    await page.getByLabel("Group name").fill("Lisbon Trip");
    await page.getByLabel("Currency").selectOption("EUR");
    await page.getByRole("button", { name: /create/i }).click();
    await expect(page).toHaveURL(/\/groups\//);
    await expect(page.getByRole("heading", { name: "Lisbon Trip" })).toBeVisible();
  });

  test("F02-E1 empty name blocked", async ({ page }) => {
    await page.goto("/groups/new");
    await page.getByRole("button", { name: /create/i }).click();
    await expect(page.getByText(/name is required|enter a name/i)).toBeVisible();
  });

  test("F02-E2 emoji and accents in name", async ({ page }) => {
    await page.goto("/groups/new");
    await page.getByLabel("Group name").fill("🏖 Vacação");
    await page.getByRole("button", { name: /create/i }).click();
    await expect(page).toHaveURL(/\/groups\//);
    await expect(page.getByRole("heading", { name: "🏖 Vacação" })).toBeVisible();
  });

  test("F02-E4 double-click creates only one group", async ({ page }) => {
    await page.goto("/groups/new");
    await page.getByLabel("Group name").fill("Double Click Test");
    const btn = page.getByRole("button", { name: /create/i });
    await Promise.all([btn.click(), btn.click()]);
    await expect(page).toHaveURL(/\/groups\//);
    await expect(btn).toBeDisabled();
  });

  test("F02-E6 mobile width — form usable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/groups/new");
    await assertA11y(page);
    const input = page.getByLabel("Group name");
    await expect(input).toBeVisible();
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});
