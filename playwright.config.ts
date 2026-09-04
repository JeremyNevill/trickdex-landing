import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against the actual static export in ./out — the exact artifact that
 * ships to Vercel — served by `npx serve`. `next build` must have run first;
 * the `test` npm script builds then tests. `serve` is started by webServer.
 *
 * Philosophy: assert STRUCTURE and INVARIANTS, not specific trick data (names
 * change, tricks get added/removed). e.g. ">= 300 trick links", not "338".
 *
 * DEVICE MATRIX (Tier-1 cross-device / iOS check — free, in-CI):
 * The `mobile-*` projects run the responsive + accessibility suite
 * (mobile-a11y.spec.ts) on Playwright's WebKit engine — the same engine family
 * as iOS Safari, so it catches the layout/contrast/tap-target bugs emulation
 * can reach — plus a small-Android Chromium for the other side of the market.
 * WebKit ≠ Apple's shipped Safari, so this does NOT replace a real-device or
 * on-phone check for iOS-Safari-only quirks (dynamic 100vh, safe-area insets,
 * momentum scroll). It's the cheap 90% that runs on every PR.
 *
 * DEVICES: chosen from the real Plausible split (Sep 2026) — iOS ~57% +
 * Mac ~12% = ~69% Apple/WebKit, Android ~17%, iPadOS <1% (27 visitors). So:
 * two iOS WebKit projects (small + mainstream viewport) as the primary gate,
 * one Android Chromium for the ~17% slice, and NO iPad (tablet ~1% — not worth
 * maintaining a multi-column layout). Revisit if the traffic mix shifts.
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
    // Existing desktop project. Runs the structural smoke/interactions suite —
    // NOT the mobile-a11y spec, which is device-specific (see mobile projects).
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile-a11y\.spec\.ts/,
    },

    // ── Tier-1 device matrix. Only the mobile-a11y spec runs on these so we
    //    don't pay to run the whole suite four extra times; the responsive and
    //    a11y invariants are what vary by device.
    {
      name: "mobile-safari-small", // iPhone SE — smallest current viewport (375px)
      testMatch: /mobile-a11y\.spec\.ts/,
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "mobile-safari", // a mid/large iPhone
      testMatch: /mobile-a11y\.spec\.ts/,
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "mobile-chrome", // Android ~17% of traffic — the non-WebKit side
      testMatch: /mobile-a11y\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
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
