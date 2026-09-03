/**
 * Generate the 301 redirect map in vercel.json from the committed trick snapshot.
 *
 * WHY THIS EXISTS
 * Google already indexes the OLD ASP.NET URLs (/Tricks, /Tricks/Details/{id}).
 * The static encyclopedia ships different URLs (/tricks/wkb{id}-{slug}). To keep
 * that inbound link equity we 301 every old URL to its new canonical in ONE hop,
 * generated at build from the SAME snapshot the pages are built from — so a slug
 * can never diverge from the page it points at. (If a second slugger existed,
 * the 301s would 404. We reuse lib/tricks.ts's slug functions, mirrored below.)
 *
 * WHY vercel.json AND NOT next.config redirects()
 * The site is `output: "export"` (static). Next.js drops async redirects() on a
 * static export — they would silently never ship. Vercel reads redirects from
 * vercel.json at the edge, which does work for a static deploy.
 *
 * STATUS CODE: `permanent: true` emits HTTP 308 (Vercel's native permanent
 * redirect), NOT 301. 308 is SEO-equivalent — cached, passes link equity, and
 * Google treats it identically to 301. vercel.json config redirects cannot emit
 * a literal 301 (only 307/308); that would need a per-request function, which
 * the brief explicitly rules out. The curl check should expect 308, not 301.
 *
 * CASE: the old IIS URLs are case-INSENSITIVE (/Tricks == /tricks); Vercel's CDN
 * is case-SENSITIVE and does not lowercase paths. Vercel `source` is
 * path-to-regexp, which has no reliable inline (?i) flag — so we emit BOTH the
 * PascalCase (as Google indexed them) and lowercase variant of each old URL as
 * explicit entries rather than gamble on case-folding. Count stays ~1018, well
 * under Vercel's 2048 redirect cap.
 *
 * This script REGENERATES the `redirects` array in vercel.json and leaves every
 * other key (headers/CSP, cleanUrls, framework…) untouched. Wired into `build`
 * so it can never drift from data/tricks.json.
 *
 * Run: node scripts/gen-redirects.mjs   (build does this automatically)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── Slug logic — MUST match lib/tricks.ts exactly (that is what produced the
//    live page URLs). Mirrored here (not imported) because this is a plain .mjs
//    build script and lib/tricks.ts is TS with a "@/..." path alias. Kept in
//    lockstep; the test suite asserts the two agree on the whole snapshot.

/** "BB …" entries are coaching drills, not tricks — they have no public page. */
function isExcludedTrick(name) {
  return /^BB(?![A-Za-z])/.test(name.trim());
}

/** Strip the "(or Mobius)" alias tail → the display name the slug is built from. */
function displayNameOf(name) {
  const m = name.match(/\(or\s+([^)]+)\)/i);
  if (!m) return name.trim();
  return name.replace(m[0], "").replace(/\s{2,}/g, " ").trim();
}

/** URL-safe slug from the alias-stripped display name. */
function toSlug(displayName) {
  return (
    displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "trick"
  );
}

/** Canonical trick path: /tricks/wkb{id}-{slug}. */
function trickPath(trickId, slug) {
  return `/tricks/wkb${trickId}-${slug}`;
}

/**
 * Build the ordered redirects array from a snapshot object ({ tricks: [...] }).
 * Pure + exported so the test suite can assert its shape without touching disk.
 *
 * Vercel `source` is path-to-regexp and case-SENSITIVE, so every old URL is
 * emitted in BOTH the PascalCase form Google indexed (/Tricks/Details/74) and a
 * lowercase form (/tricks/details/74, the brief's explicit extra). The new URL
 * scheme is all-lowercase, so the slugless belt-and-braces rule is lowercase
 * only. `trailingSlash:false` + `cleanUrls` in vercel.json normalise the
 * trailing-slash variant before matching, so we don't emit those separately.
 */
export function buildRedirects(snapshot) {
  const tricks = snapshot.tricks ?? [];
  const included = tricks.filter((t) => !isExcludedTrick(t.name));
  const excluded = tricks.filter((t) => isExcludedTrick(t.name));

  const redirects = [];

  // 1) Old index → the encyclopedia home. Both cases.
  redirects.push({ source: "/Tricks", destination: "/", permanent: true });
  redirects.push({ source: "/tricks", destination: "/", permanent: true });

  // 2) Every trick with a public page: /Tricks/Details/{id} → canonical,
  //    plus the lowercase /tricks/details/{id} variant.
  for (const t of included) {
    const dest = trickPath(t.trickId, toSlug(displayNameOf(t.name)));
    redirects.push({
      source: `/Tricks/Details/${t.trickId}`,
      destination: dest,
      permanent: true,
    });
    redirects.push({
      source: `/tricks/details/${t.trickId}`,
      destination: dest,
      permanent: true,
    });
  }

  // 3) BB drills (ids 366–386) have NO page. Send them to home, not a 404.
  //    One path-to-regexp alternation rule per case over the actual ids.
  if (excluded.length > 0) {
    const ids = excluded.map((t) => t.trickId).sort((a, b) => a - b);
    const group = `:id(${ids.join("|")})`;
    redirects.push({
      source: `/Tricks/Details/${group}`,
      destination: "/",
      permanent: true,
    });
    redirects.push({
      source: `/tricks/details/${group}`,
      destination: "/",
      permanent: true,
    });
  }

  // 4) Belt & braces: a slugless /tricks/wkb{id} (a stale link whose slug was
  //    dropped, or a name change) 308s to the current canonical so a rename
  //    never strands links. New scheme is lowercase, so lowercase only.
  for (const t of included) {
    redirects.push({
      source: `/tricks/wkb${t.trickId}`,
      destination: trickPath(t.trickId, toSlug(displayNameOf(t.name))),
      permanent: true,
    });
  }

  return redirects;
}

// ── CLI: rewrite vercel.json's `redirects` key in place. ────────────────────
function main() {
  const snapshotPath = path.join(ROOT, "data", "tricks.json");
  const vercelPath = path.join(ROOT, "vercel.json");

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  const config = JSON.parse(fs.readFileSync(vercelPath, "utf-8"));

  const redirects = buildRedirects(snapshot);
  if (redirects.length > 1024) {
    throw new Error(
      `Generated ${redirects.length} redirects, over Vercel's 1024 cap. ` +
        `Collapse more variants into regex sources.`,
    );
  }

  config.redirects = redirects;
  fs.writeFileSync(vercelPath, JSON.stringify(config, null, 2) + "\n");

  const included = snapshot.tricks.filter((t) => !isExcludedTrick(t.name)).length;
  const excluded = snapshot.tricks.length - included;
  console.log(
    `Wrote ${redirects.length} redirects to vercel.json ` +
      `(${included} trick pages, ${excluded} BB drills → /, +slugless +index).`,
  );
}

// Only run the CLI when invoked directly, not when imported by a test.
if (import.meta.url === `file://${process.argv[1]}`) main();
