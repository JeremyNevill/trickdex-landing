import { test, expect } from "@playwright/test";
import { getAllTricks } from "../lib/tricks";

/**
 * Issue #5: alias + fuzzy search, and a log link under the definition.
 * These assert specific tricks (Raley WKB127, Back Mobe) because that is the
 * acceptance check — the structural smoke tests stay data-agnostic.
 */

async function search(page: import("@playwright/test").Page, query: string) {
  await page.goto("/");
  const input = page.getByPlaceholder(/search tricks/i);
  await input.fill(query);
  await expect(page.locator("#search-results")).toBeVisible();
}

test.describe("Search aliases and ranking", () => {
  test("curated aliases survive outside the snapshot and do not change the slug", async () => {
    const tricks = await getAllTricks();
    const raley = tricks.find((t) => t.trickId === 127);
    const mobe = tricks.find((t) => t.trickId === 86);
    expect(raley?.slug).toBe("raley");
    expect(raley?.misspellings.map((a) => a.toLowerCase())).toContain("railey");
    expect(raley?.aliases.map((a) => a.toLowerCase())).not.toContain("railey");
    expect(mobe?.slug).toBe("back-mobe");
    expect(mobe?.aliases.map((a) => a.toLowerCase())).toContain("mobius");
  });

  test("railey finds Raley (WKB127)", async ({ page }) => {
    await search(page, "railey");
    const hit = page.locator("#search-results a[href='/tricks/wkb127-raley']");
    await expect(hit).toBeVisible();
    await expect(hit).toContainText("Raley");
    await expect(hit).toContainText("WKB127");
  });

  test("raley ranks the exact name above description matches", async ({ page }) => {
    await search(page, "raley");
    const cards = page.locator("#search-results [data-trick]");
    expect(await cards.count()).toBeGreaterThan(1);
    await expect(cards.first().locator("a")).toHaveAttribute("href", "/tricks/wkb127-raley");
    await expect(cards.first()).toContainText("WKB127");
  });

  test("Mobius finds Back Mobe", async ({ page }) => {
    await search(page, "Mobius");
    const cards = page.locator("#search-results [data-trick]");
    await expect(cards.first().locator("a")).toHaveAttribute("href", "/tricks/wkb86-back-mobe");
    await expect(cards.first()).toContainText("Back Mobe");
    await expect(cards.first()).toContainText("WKB86");
  });
});

test.describe("Log link under the definition", () => {
  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "iphone", width: 390, height: 844 },
  ] as const;

  for (const viewport of viewports) {
    test(`Raley shows a log link under the definition at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/tricks/wkb127-raley");

      const definition = page.getByText(/superman/i);
      const log = page.getByRole("link", { name: /log this trick/i });
      const video = page.locator("main video, main iframe").first();
      const lower = page.getByRole("link", { name: /track this trick in the free app/i });

      await expect(log).toBeVisible();
      await expect(log).toHaveAttribute("href", "https://app.wakeboard.com/tricks/127");
      await expect(lower).toHaveAttribute("href", "https://app.wakeboard.com/tricks/127");
      // A misspelling is searchable, not an "also known as" name.
      await expect(page.getByText(/also known as/i)).toHaveCount(0);

      const defBox = await definition.boundingBox();
      const logBox = await log.boundingBox();
      const videoBox = await video.boundingBox();
      const lowerBox = await lower.boundingBox();
      expect(defBox).not.toBeNull();
      expect(logBox).not.toBeNull();
      expect(videoBox).not.toBeNull();
      expect(lowerBox).not.toBeNull();

      // Under the definition, above the clips, and in the first screen —
      // no scroll past the videos.
      expect(logBox!.y).toBeGreaterThanOrEqual(defBox!.y + defBox!.height - 1);
      expect(logBox!.y + logBox!.height).toBeLessThanOrEqual(videoBox!.y + 1);
      expect(logBox!.y).toBeGreaterThanOrEqual(0);
      expect(logBox!.y + logBox!.height).toBeLessThanOrEqual(viewport.height);
      expect(lowerBox!.y).toBeGreaterThan(videoBox!.y);
    });
  }
});
