import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
// The real page-slug functions — the SAME code that produced the live page
// URLs. We rebuild the expected destinations from these; if the generator ever
// drifted from them a 308 would land on a 404. (The generator itself is a plain
// .mjs CLI and can't be imported by Playwright's CJS runner, so the
// "up to date" check re-runs it via node and diffs the output instead.)
import { toSlug, parseAliases, isExcludedTrick } from "../lib/tricks";
import snapshot from "../data/tricks.json";

/**
 * The old ASP.NET URLs (/Tricks, /Tricks/Details/{id}) that Google indexed must
 * 308 in one hop to the static encyclopedia URLs. Vercel doesn't run in the
 * local static-serve test rig, so we can't observe live 308s here — instead we
 * verify the generated redirect MAP is correct and complete, and (the real bug
 * guard) that every destination resolves to a page that actually built.
 */

const ROOT = path.resolve(__dirname, "..");
const vercel = JSON.parse(
  fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"),
);
const redirects: { source: string; destination: string; permanent: boolean }[] =
  vercel.redirects;
const bySource = new Map(redirects.map((r) => [r.source, r]));

const included = snapshot.tricks.filter((t) => !isExcludedTrick(t.name));
const excluded = snapshot.tricks.filter((t) => isExcludedTrick(t.name));

test.describe("redirect map — generation", () => {
  test("vercel.json is up to date with the snapshot (re-running the generator is a no-op)", () => {
    // Fails if someone edited the snapshot but forgot to re-run the generator
    // (build does it automatically; this catches a stale hand-edit). Re-run it
    // and assert the redirects array is byte-identical to what's committed.
    const before = JSON.stringify(redirects);
    execFileSync("node", ["scripts/gen-redirects.mjs"], { cwd: ROOT });
    const after = JSON.stringify(
      JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8")).redirects,
    );
    expect(after).toBe(before);
  });

  test("all redirects are permanent (308) and under Vercel's 2048 cap", () => {
    expect(redirects.every((r) => r.permanent === true)).toBe(true);
    expect(redirects.length).toBeLessThanOrEqual(2048);
  });

  test("no duplicate source patterns", () => {
    expect(bySource.size).toBe(redirects.length);
  });

  test("the old index redirects to home, both cases", () => {
    expect(bySource.get("/Tricks")?.destination).toBe("/");
    expect(bySource.get("/tricks")?.destination).toBe("/");
  });

  test("every trick with a page has Pascal + lowercase detail redirects", () => {
    for (const t of included) {
      const dest = `/tricks/wkb${t.trickId}-${toSlug(parseAliases(t.name).displayName)}`;
      expect(bySource.get(`/Tricks/Details/${t.trickId}`)?.destination).toBe(dest);
      expect(bySource.get(`/tricks/details/${t.trickId}`)?.destination).toBe(dest);
    }
  });

  test("BB drill ids route to home, not a 404, in one alternation rule per case", () => {
    const ids = excluded.map((t) => t.trickId).sort((a, b) => a - b);
    const group = `:id(${ids.join("|")})`;
    expect(bySource.get(`/Tricks/Details/${group}`)?.destination).toBe("/");
    expect(bySource.get(`/tricks/details/${group}`)?.destination).toBe("/");
    // and no BB id got an individual redirect landing on a (non-existent) page
    for (const id of ids) {
      expect(bySource.has(`/Tricks/Details/${id}`)).toBe(false);
    }
  });

  test("belt & braces: slugless /tricks/wkb{id} 308s to the canonical slug", () => {
    for (const t of included) {
      const dest = `/tricks/wkb${t.trickId}-${toSlug(parseAliases(t.name).displayName)}`;
      expect(bySource.get(`/tricks/wkb${t.trickId}`)?.destination).toBe(dest);
    }
  });

  test("the brief's worked examples resolve exactly", () => {
    const cases: [string, string][] = [
      ["/Tricks/Details/74", "/tricks/wkb74-flavor-flip"],
      ["/tricks/details/74", "/tricks/wkb74-flavor-flip"],
      ["/Tricks/Details/127", "/tricks/wkb127-raley"],
      ["/tricks/wkb86", "/tricks/wkb86-back-mobe"],
      ["/Tricks/Details/47", "/tricks/wkb47-3-to-3-or-zero"],
      ["/tricks/wkb111", "/tricks/wkb111-slim-chance"],
    ];
    for (const [src, dest] of cases) {
      expect(bySource.get(src)?.destination, src).toBe(dest);
    }
  });

  test("/Compares and /Products are NOT redirected (they still rank)", () => {
    for (const r of redirects) {
      expect(r.source.startsWith("/Compares")).toBe(false);
      expect(r.source.startsWith("/Products")).toBe(false);
    }
  });
});

test.describe("redirect map — destinations are real built pages", () => {
  // The static export writes /tricks/wkb{id}-{slug}.html into out/. Every
  // non-home destination must exist on disk — this is the real 404 guard.
  const outDir = path.join(ROOT, "out");

  test("every trick destination has a built HTML file", () => {
    const destinations = new Set(
      redirects.map((r) => r.destination).filter((d) => d !== "/"),
    );
    const missing: string[] = [];
    for (const d of destinations) {
      const file = path.join(outDir, `${d}.html`);
      if (!fs.existsSync(file)) missing.push(d);
    }
    expect(missing, `destinations with no built page:\n${missing.join("\n")}`).toEqual([]);
  });
});
