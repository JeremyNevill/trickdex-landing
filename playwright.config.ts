import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against the actual static export in ./out — the exact artifact that
 * ships to Vercel — served by `npx serve`. `next build` must have run first;
 * the `test` npm script builds then tests. `serve` is started by webServer.
 *
 * Philosophy: assert STRUCTURE and INVARIANTS, not specific trick data (names
 * change, tricks get added/removed). e.g. ">= 300 trick links", not "338".
 */
const PORT = 4321;

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Serve the static export exactly as a static host would. -s single-serves
    // so clean URLs (/tricks/wkb..) resolve to the .html files.
    command: `npx serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    timeout: 30000,
    reuseExistingServer: true,
  },
});
