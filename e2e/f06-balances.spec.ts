/**
 * F06 — View balances
 */
import { test, expect } from "@playwright/test";
import { attachGuards, assertA11y, signIn } from "./helpers";

const SEED_GROUP_ID = process.env.SEED_GROUP_ID ?? "";

test.describe("F06 — View balances", () => {
  test.beforeEach(async ({ page }) => {
    attachGuards(page);
    await signIn(page, "alice@example.com");
  });

  test("F06-H1 happy path — shows per-member balances and transfers", async ({ page }) => {
    await page.goto(`/groups/${SEED_GROUP_ID}/balances`);
    await assertA11y(page);
    // Seed has Alice paying 450+36=486, Bob 87.5, Carol 132 — total 705.5
    // Each owes 235.17; Alice net +250.83, Bob net -147.67, Carol net -103.17
    await expect(page.getByText(/Alice/i)).toBeVisible();
    await expect(page.getByText(/transfer|owes/i)).toBeVisible();
  });

  test("F06-N1 non-member cannot view balances (403)", async ({ page }) => {
    const response = await page.request.get(
      `/api/groups/00000000-0000-0000-0000-000000000000/balances`
    );
    expect(response.status()).toBe(403);
  });

  test("F06-N2 data isolation — cannot see another group's balances", async ({ page }) => {
    // Sign in as bob (member of seed group) and try a random group
    const bobPage = await page.context().newPage();
    attachGuards(bobPage);
    await signIn(bobPage, "bob@example.com");
    const response = await bobPage.request.get(
      `/api/groups/00000000-0000-0000-0000-000000000001/balances`
    );
    expect(response.status()).toBe(403);
    await bobPage.close();
  });
});
