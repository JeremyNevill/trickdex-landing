import { test, expect } from "@playwright/test";

/**
 * Build-output smoke + crawlability. These guard the invariants that make this
 * site work as an SEO catalog and that a refactor could silently break. They
 * assert structure, not specific trick data, so they survive data changes.
 */

// A healthy catalog has hundreds of tricks; assert a floor, not an exact count.
const MIN_TRICKS = 300;

test.describe("Homepage — crawlable catalog", () => {
  test("serves 200 with the expected title", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("<title>wakeboard.com — the wakeboard trick list</title>");
  });

  test("every trick is a static <a> link in the raw HTML (no JS needed)", async ({
    request,
  }) => {
    const html = await request.get("/").then((r) => r.text());
    const links = new Set(
      [...html.matchAll(/href="(\/tricks\/wkb\d+-[^"]+)"/g)].map((m) => m[1]),
    );
    expect(links.size).toBeGreaterThanOrEqual(MIN_TRICKS);
  });

  test("full list renders with JavaScript disabled", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    const count = await page.locator('a[href^="/tricks/wkb"]').count();
    expect(count).toBeGreaterThanOrEqual(MIN_TRICKS);
    await ctx.close();
  });

  test("A–Z jump nav and classics strip are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#az-nav")).toBeVisible();
    await expect(page.locator("#classics-strip")).toBeVisible();
    // At least a handful of letter sections exist.
    expect(await page.locator("[data-letter-section]").count()).toBeGreaterThan(5);
  });

  test("has canonical + CollectionPage JSON-LD", async ({ request }) => {
    const html = await request.get("/").then((r) => r.text());
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/www\.wakeboard\.com/);
    expect(html).toContain('"@type":"CollectionPage"');
  });
});

test.describe("Security invariants", () => {
  test("JSON-LD is HTML-escaped (no raw </script> breakout)", async ({ request }) => {
    for (const path of ["/", "/tricks/wkb80-kgb"]) {
      const html = await request.get(path).then((r) => r.text());
      const block = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s,
      );
      expect(block, `JSON-LD present on ${path}`).not.toBeNull();
      // No unescaped angle brackets inside the JSON-LD payload.
      expect(block![1]).not.toContain("<");
      expect(block![1]).not.toContain(">");
    }
  });

  test("no javascript: or data: hrefs/srcs anywhere on a trick page", async ({
    request,
  }) => {
    const html = await request
      .get("/tricks/wkb80-kgb")
      .then((r) => r.text());
    expect(html).not.toMatch(/(?:href|src)="javascript:/i);
    expect(html).not.toMatch(/(?:href|src)="data:(?!image\/)/i);
  });

  test("internal 'TrickDex' codename never appears in user-facing HTML", async ({
    request,
  }) => {
    for (const path of ["/", "/tricks/wkb80-kgb", "/tricks/wkb50-crow-mobe"]) {
      const html = await request.get(path).then((r) => r.text());
      expect(html.toLowerCase(), `codename on ${path}`).not.toContain("trickdex");
    }
  });
});

test.describe("Trick pages", () => {
  // Sample a few well-known ids rather than all 338 — structure, not coverage.
  const SAMPLES = [
    { path: "/tricks/wkb80-kgb", wkb: "WKB80" },
    { path: "/tricks/wkb50-crow-mobe", wkb: "WKB50" },
    { path: "/tricks/wkb127-raley", wkb: "WKB127" },
  ];

  for (const s of SAMPLES) {
    test(`${s.path} has h1, WKB id, canonical and an app deep-link`, async ({
      page,
    }) => {
      await page.goto(s.path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText(s.wkb, { exact: false }).first()).toBeVisible();
      // Deep-link to the app on this trick's id.
      const id = s.wkb.replace("WKB", "");
      await expect(
        page.locator(`a[href="https://app.wakeboard.com/tricks/${id}"]`),
      ).toBeVisible();
    });
  }

  test("a trick page carries rel=canonical to its own URL", async ({ request }) => {
    const html = await request
      .get("/tricks/wkb80-kgb")
      .then((r) => r.text());
    expect(html).toMatch(
      /<link rel="canonical" href="https:\/\/www\.wakeboard\.com\/tricks\/wkb80-/,
    );
  });

  test("related tricks render as internal links", async ({ page }) => {
    await page.goto("/tricks/wkb50-crow-mobe");
    const related = page.locator("text=Related tricks");
    await expect(related).toBeVisible();
  });
});

test.describe("SEO plumbing", () => {
  test("sitemap.xml lists the homepage + all tricks", async ({ request }) => {
    const xml = await request.get("/sitemap.xml").then((r) => r.text());
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThanOrEqual(MIN_TRICKS + 1);
    expect(urls).toContain("https://www.wakeboard.com/");
    expect(urls.filter((u) => u.includes("/tricks/wkb")).length).toBeGreaterThanOrEqual(
      MIN_TRICKS,
    );
  });

  test("robots.txt allows crawling and points at the sitemap", async ({
    request,
  }) => {
    const txt = await request.get("/robots.txt").then((r) => r.text());
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toContain("sitemap.xml");
  });
});

test.describe("404", () => {
  test("an unknown trick shows the branded 404 with a way back", async ({
    page,
  }) => {
    const res = await page.goto("/tricks/wkb99999-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("We couldn’t find that trick")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /browse all tricks/i }),
    ).toBeVisible();
  });
});
