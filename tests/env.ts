/**
 * Remote preview/production origin for Playwright.
 *
 * Set PREVIEW_URL or BASE_URL (or PLAYWRIGHT_BASE_URL) to a non-localhost
 * http(s) origin to skip the local `serve ./out` webServer and hit a live
 * host (the Vercel preview in CI). Local `npm test` / `test:only` leave
 * these unset and keep serving ./out on localhost.
 */
export function remoteBaseURL(): string | null {
  const candidates = [
    process.env.PREVIEW_URL,
    process.env.BASE_URL,
    process.env.PLAYWRIGHT_BASE_URL,
  ];
  for (const raw of candidates) {
    const v = raw?.trim();
    if (!v) continue;
    if (!/^https?:\/\//i.test(v)) continue;
    if (/localhost|127\.0\.0\.1/i.test(v)) continue;
    return v.replace(/\/$/, "");
  }
  return null;
}
