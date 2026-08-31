import { test, expect } from "@playwright/test";

/**
 * The only client-side JS on the site: progressive-enhancement search and the
 * A–Z jump nav. The full list is static HTML (covered in smoke.spec); these
 * tests cover the enhancement layered on top.
 */

test.describe("Search (progressive enhancement)", () => {
  test("filters the list and shows a result count", async ({ page }) => {
    await page.goto("/");
    const search = page.getByPlaceholder(/search tricks/i);
    await search.fill("raley");
    // A live count appears.
    await expect(page.getByText(/\d+ of \d+ tricks/)).toBeVisible();
    // Fewer trick cards are visible than the full list.
    const visible = await page
      .locator('[data-trick]:visible')
      .count();
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThan(300);
  });

  test("hides the classics strip and A–Z nav while searching", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#classics-strip")).toBeVisible();
    await page.getByPlaceholder(/search tricks/i).fill("mobe");
    await expect(page.locator("#classics-strip")).toBeHidden();
    await expect(page.locator("#az-nav")).toBeHidden();
  });

  test("clearing the search restores the full list", async ({ page }) => {
    await page.goto("/");
    const search = page.getByPlaceholder(/search tricks/i);
    await search.fill("tantrum");
    await expect(page.locator("#classics-strip")).toBeHidden();
    await search.fill("");
    await expect(page.locator("#classics-strip")).toBeVisible();
    await expect(page.locator("#az-nav")).toBeVisible();
  });

  test("a no-match query shows a clear empty state", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/search tricks/i).fill("zzzznotarealtrickzzzz");
    await expect(page.getByText(/no tricks match/i)).toBeVisible();
  });

  test("can find a trick by its WKB number", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/search tricks/i).fill("wkb80");
    const kgb = page.locator('[data-trick]:visible', { hasText: "KGB" });
    await expect(kgb.first()).toBeVisible();
  });
});

test.describe("A–Z navigation", () => {
  test("a letter jump link scrolls to its section", async ({ page }) => {
    await page.goto("/");
    // Click a letter that reliably has tricks.
    await page.locator('#az-nav a', { hasText: "R" }).first().click();
    await expect(page).toHaveURL(/#letter-R$/);
    // The R section is scrolled into view.
    await expect(page.locator("#letter-R")).toBeInViewport();
  });
});

test.describe("Related-trick navigation", () => {
  test("clicking a related trick opens that trick page", async ({ page }) => {
    await page.goto("/tricks/wkb80-kgb");
    // Switch KGB is a related trick of KGB.
    const link = page.locator('a[href^="/tricks/"]', { hasText: "Switch KGB" });
    await expect(link.first()).toBeVisible();
    await link.first().click();
    await expect(page.locator("h1")).toContainText("Switch KGB");
  });
});
