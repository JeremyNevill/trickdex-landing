import { test, expect } from "@playwright/test";

/**
 * "Log this trick" is the www → app conversion under the trick definition.
 * The click must notify Plausible once and still follow the deep link.
 * The stub replaces window.plausible before the inline queue runs
 * (`plausible = plausible || …`), and the real script is blocked so it
 * cannot overwrite the stub.
 */

const TRICK_PATH = "/tricks/wkb80-kgb";
const APP_TRICK_URL = "https://app.wakeboard.com/tricks/80";

test("Log this trick fires one Plausible event and still opens the app", async ({
  page,
}) => {
  const events: unknown[] = [];
  page.on("console", (msg) => {
    const prefix = "PLAUSIBLE_EVENT ";
    const text = msg.text();
    if (!text.startsWith(prefix)) return;
    events.push(JSON.parse(text.slice(prefix.length)));
  });

  await page.addInitScript(() => {
    const plausible = Object.assign(
      (...args: unknown[]) => {
        console.log("PLAUSIBLE_EVENT " + JSON.stringify(args));
      },
      { init: () => {}, q: [] as unknown[] },
    );
    (window as unknown as { plausible: typeof plausible }).plausible = plausible;
  });

  await page.route("https://plausible.io/**", (route) => route.abort());
  await page.route("https://app.wakeboard.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><head><title>app</title></head><body>app</body></html>",
    }),
  );

  await page.goto(TRICK_PATH);

  const logLink = page.getByRole("link", { name: "Log this trick" });
  await expect(logLink).toHaveAttribute("href", APP_TRICK_URL);
  await expect(logLink).toHaveAttribute("data-trick-id", "80");
  await expect(logLink).toHaveAttribute("data-trick-slug", "kgb");
  await expect(logLink).toHaveAttribute("data-page-type", "trick");

  // The pill under the clips deep-links to the same URL but is not this event.
  const pill = page.getByRole("link", { name: "Track this trick in the free app" });
  await pill.evaluate((el) => {
    el.addEventListener("click", (event) => event.preventDefault());
  });
  await pill.click();
  expect(events).toEqual([]);

  await Promise.all([page.waitForURL(APP_TRICK_URL), logLink.click()]);

  expect(events).toEqual([
    [
      "Log Trick Click",
      {
        props: {
          trickId: "80",
          trickSlug: "kgb",
          pageType: "trick",
        },
      },
    ],
  ]);
});
