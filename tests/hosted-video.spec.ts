import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { remoteBaseURL } from "./env";

/**
 * Self-hosted trick video (WakeboardUK #201, trickdex-landing #11).
 *
 * A trick whose snapshot media is a hosted MP4 must render a native <video>,
 * not be dropped as an unknown type. The trick is picked from the committed
 * snapshot rather than hardcoded, so this survives data changes; it skips if
 * the snapshot has no hosted video at all.
 */

type SnapshotMedia = { mediaType: string; uri: string; posterUri?: string | null };
type SnapshotTrick = { trickId: number; media: SnapshotMedia[] };

const snapshot = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "tricks.json"), "utf-8"),
) as { tricks: SnapshotTrick[] };

const hostedTrick = snapshot.tricks.find((t) =>
  t.media.some((m) => m.mediaType === "Hosted"),
);
const hostedMedia = hostedTrick?.media.find((m) => m.mediaType === "Hosted");

test.describe("Trick page — hosted video", () => {
  test.skip(!hostedTrick, "snapshot has no hosted video");

  test("renders a native <video> that loads from the media CDN", async ({ page }) => {
    await page.goto("/");
    const href = await page
      .locator(`a[href^="/tricks/wkb${hostedTrick!.trickId}-"]`)
      .first()
      .getAttribute("href");
    expect(href).toBeTruthy();

    const res = await page.goto(href!);
    expect(res?.status()).toBe(200);

    const video = page.locator(`video[src="${hostedMedia!.uri}"]`);
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute("controls", "");
    if (hostedMedia!.posterUri) {
      await expect(video).toHaveAttribute("poster", hostedMedia!.posterUri);
    }

    // The CSP only exists on the deployed host (vercel.json headers), not on the
    // local static server, so only assert it there. Without media-src the
    // browser refuses to load the clip.
    if (remoteBaseURL()) {
      expect(res?.headers()["content-security-policy"] ?? "").toContain(
        "media-src https://media.wakeboard.co.uk",
      );
    }

    // HAVE_METADATA or better: the browser fetched and understood the file.
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), {
        timeout: 15000,
      })
      .toBeGreaterThanOrEqual(1);
  });
});
