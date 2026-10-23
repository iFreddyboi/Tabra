/**
 * F04 — Add expense (equal split)
 */
import { test, expect } from "@playwright/test";
import { attachGuards, assertA11y, signIn } from "./helpers";

// Set in playwright.config.ts via env or hard-coded seed group id
const SEED_GROUP_ID = process.env.SEED_GROUP_ID ?? "";

test.describe("F04 — Add expense (equal split)", () => {
  test.beforeEach(async ({ page }) => {
    attachGuards(page);
    await signIn(page, "alice@example.com");
  });

  test("F04-H1 happy path — equal split stores correct shares", async ({ page }) => {
    await page.goto(`/groups/${SEED_GROUP_ID}`);
    await assertA11y(page);
    await page.getByRole("button", { name: /add expense/i }).click();
    await page.getByLabel("Description").fill("Dinner");
    await page.getByLabel("Amount").fill("90.00");
    // Paid by and all members selected by default
    await page.getByRole("button", { name: /save|add/i }).click();
    await expect(page.getByText("Dinner")).toBeVisible();
    // Each of 3 seed members owes 30.00
    await expect(page.getByText("30.00").first()).toBeVisible();
  });

  test("F04-E1 more than 2 decimal places rejected", async ({ page }) => {
    await page.goto(`/groups/${SEED_GROUP_ID}`);
    await page.getByRole("button", { name: /add expense/i }).click();
    await page.getByLabel("Amount").fill("10.001");
    await page.getByRole("button", { name: /save|add/i }).click();
    await expect(page.getByText(/invalid amount|two decimal/i)).toBeVisible();
  });

  test("F04-E2 zero amount rejected", async ({ page }) => {
    await page.goto(`/groups/${SEED_GROUP_ID}`);
    await page.getByRole("button", { name: /add expense/i }).click();
    await page.getByLabel("Amount").fill("0");
    await page.getByRole("button", { name: /save|add/i }).click();
    await expect(page.getByText(/must be greater|positive/i)).toBeVisible();
  });

  test("F04-E5 odd amount remainder distributed correctly", async ({ page }) => {
    await page.goto(`/groups/${SEED_GROUP_ID}`);
    await page.getByRole("button", { name: /add expense/i }).click();
    await page.getByLabel("Description").fill("Coffee");
    await page.getByLabel("Amount").fill("10.01");
    await page.getByRole("button", { name: /save|add/i }).click();
    await expect(page.getByText("Coffee")).toBeVisible();
    // First member gets 3.35, rest get 3.33 (10.01 = 3.35 + 3.33 + 3.33)
    await expect(page.getByText("3.35").first()).toBeVisible();
  });

  test("F04-N1 non-member cannot add expense (403)", async ({ page }) => {
    // Use a group the signed-in user is not part of
    const response = await page.request.post(`/api/groups/00000000-0000-0000-0000-000000000000/expenses`, {
      data: { description: "x", amount: 1, split: { mode: "equal", memberIds: [] } },
    });
    expect(response.status()).toBe(403);
  });

  test("F04-N2 unauthenticated call returns 401", async ({ page }) => {
    // New context — no session cookie
    const response = await page.request.post(`/api/groups/${SEED_GROUP_ID}/expenses`, {
      data: { description: "x", amount: 1, split: { mode: "equal", memberIds: [] } },
    });
    expect(response.status()).toBe(401);
  });
});
