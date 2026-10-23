/**
 * F03 — Invite / guest join
 */
import { test, expect } from "@playwright/test";
import { attachGuards, assertA11y } from "./helpers";

const SEED_TOKEN = "seed-lisbon-invite-token-001";

test.describe("F03 — Guest join via invite link", () => {
  test.beforeEach(({ page }) => attachGuards(page));

  test("F03-H1 happy path — guest joins without account", async ({ page }) => {
    await page.goto(`/join/${SEED_TOKEN}`);
    await assertA11y(page);
    await expect(page.getByText(/Lisbon Trip/i)).toBeVisible();
    await page.getByLabel("Your name").fill("Dana Guest");
    await page.getByRole("button", { name: /join/i }).click();
    await expect(page.getByText(/you.re in|joined/i)).toBeVisible();
  });

  test("F03-E1 invalid token shows 404 message", async ({ page }) => {
    await page.goto("/join/totally-invalid-token-xyz");
    await expect(page.getByText(/not found|link not found|invalid/i)).toBeVisible();
  });

  test("F03-E2 empty name blocked", async ({ page }) => {
    await page.goto(`/join/${SEED_TOKEN}`);
    await page.getByRole("button", { name: /join/i }).click();
    await expect(page.getByText(/name is required|enter your name/i)).toBeVisible();
  });

  test("F03-E3 name over 100 chars rejected", async ({ page }) => {
    await page.goto(`/join/${SEED_TOKEN}`);
    await page.getByLabel("Your name").fill("A".repeat(101));
    await page.getByRole("button", { name: /join/i }).click();
    await expect(page.getByText(/too long|100 characters/i)).toBeVisible();
  });

  test("F03-N2 SQL injection stored as literal text", async ({ page }) => {
    await page.goto(`/join/${SEED_TOKEN}`);
    const injected = "'; DROP TABLE groups; --";
    await page.getByLabel("Your name").fill(injected);
    await page.getByRole("button", { name: /join/i }).click();
    // Should succeed and store literal string
    await expect(page.getByText(/you.re in|joined/i)).toBeVisible();
  });
});
