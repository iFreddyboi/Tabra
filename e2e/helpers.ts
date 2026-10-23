import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Wire up console-error and 5xx guards for every test. */
export function attachGuards(page: Page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") throw new Error(`console error: ${msg.text()}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 500) throw new Error(`${res.status()} on ${res.url()}`);
  });
}

/** Run axe and assert no violations. */
export async function assertA11y(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

/** Sign in a test user via the magic-link API short-circuit.
 *  Requires the dev server to expose GET /api/auth/test-signin?email=...
 *  which is only mounted when NODE_ENV=test. */
export async function signIn(page: Page, email: string) {
  await page.goto(`/api/auth/test-signin?email=${encodeURIComponent(email)}`);
  await page.waitForURL("/dashboard");
}
