import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Tier-1 cross-device check (free, in-CI). Runs on the mobile/tablet projects
 * defined in playwright.config.ts (WebKit for iOS-family, Chromium for Android).
 *
 * What it guards, and why each matters on a small screen:
 *  • axe accessibility — colour contrast + accessible names. This is what would
 *    have auto-caught the white "Open the app" CTA on the near-white header.
 *  • no horizontal overflow — a page wider than the viewport means the mobile
 *    layout broke somewhere (a fixed width, an unwrapped element).
 *  • tap-target size — primary links/buttons should be ~44px per Apple's HIG,
 *    or they're fiddly to hit on a phone.
 *
 * These are DEVICE-varying invariants; the structural smoke tests stay in
 * smoke.spec.ts (desktop project only). Not a substitute for a real-device or
 * on-phone iOS-Safari check — see the config header.
 */

// Apple Human Interface Guidelines minimum tappable size.
const MIN_TAP_PX = 44;

// The pages worth checking on every device: the catalog home and one detail
// page (different layout — hero, media embed, related grid, the app CTA).
const PAGES = [
  { name: "home", path: "/" },
  { name: "trick detail", path: "/tricks/wkb127-raley" },
];

/** Run axe against the current page and return violations (contrast + names). */
async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    // WCAG AA is the practical bar; scope to the rules a viewport check owns.
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  return results.violations;
}

for (const { name, path } of PAGES) {
  test.describe(`${name} (${path})`, () => {
    test("has no serious accessibility violations (incl. colour contrast)", async ({
      page,
    }) => {
      await page.goto(path);
      const violations = await axeViolations(page);
      // Surface an ACTIONABLE summary on failure — the rule, how many nodes, and
      // a sample of the distinct problems (e.g. which colour pair fails, on what
      // selector) — so a red CI run tells you what to fix, not just a count.
      const summary = violations.map((v) => {
        const samples = [
          ...new Set(
            v.nodes
              .map((n) => {
                const why = (n.any[0]?.message ?? n.failureSummary ?? "").replace(/\s+/g, " ");
                return `      ${n.target.join(" ").slice(0, 70)} — ${why.slice(0, 90)}`;
              }),
          ),
        ].slice(0, 4);
        return `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}\n${samples.join("\n")}`;
      });
      expect(summary, "\n" + summary.join("\n")).toEqual([]);
    });

    test("does not overflow the viewport horizontally", async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        // A few px of rounding is fine; a real broken layout overflows by more.
        return el.scrollWidth - el.clientWidth;
      });
      expect(overflow, `page is ${overflow}px wider than the viewport`).toBeLessThanOrEqual(1);
    });

    test("primary call-to-action buttons meet the minimum tap-target size", async ({
      page,
    }) => {
      await page.goto(path);
      // ONLY the styled primary buttons (`.btn-primary`): the header "Open the
      // app" and, on detail pages, "Track this trick". Deliberately NOT matched
      // by href — the hero copy and footer contain inline text links to the
      // same app URL that are prose, not tap targets, and shouldn't be sized.
      const ctas = page.locator("a.btn-primary");
      const count = await ctas.count();
      expect(count, "expected at least one primary CTA button on the page").toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const box = await ctas.nth(i).boundingBox();
        if (!box) continue; // not rendered/visible on this viewport — skip
        expect(
          Math.round(box.height),
          `CTA #${i} is only ${Math.round(box.height)}px tall (min ${MIN_TAP_PX})`,
        ).toBeGreaterThanOrEqual(MIN_TAP_PX);
      }
    });
  });
}
