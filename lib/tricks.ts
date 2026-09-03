/**
 * Trick data layer.
 *
 * Reads the committed snapshot at data/tricks.json — NOT a live API. That means
 * `next build` (locally and on Vercel) needs no network access. The snapshot is
 * refreshed out-of-band by `npm run snapshot` (scripts/snapshot-tricks.mjs),
 * which is the only code that talks to the API. Everything here runs at build
 * time (generateStaticParams / server components), never at request time.
 */

import snapshotJson from "@/data/tricks.json";

// "BB …" entries are coaching/drill programme items (e.g. "BB - Floaty heelside
// jumps", "BB - Switch landing drill"), not named tricks — keep them off the
// public trick list. Matches "BB" only at a word boundary so a real trick that
// merely starts with those letters would not be excluded.
export function isExcludedTrick(name: string): boolean {
  return /^BB(?![A-Za-z])/.test(name.trim());
}

export type TrickListItem = {
  trickId: number;
  name: string;
  description: string | null;
  shortCode: string | null;
  sportId: number;
  sportName: string;
  mediaCount: number;
};

export type TrickMedia = {
  mediaId: number;
  title: string | null;
  uri: string;
  mediaType: string;
  photographer: string | null;
};

export type TrickDetail = TrickListItem & {
  landedByCount: number;
  media: TrickMedia[];
};

export type Trick = TrickDetail & {
  slug: string; // wkb{id}-{slug}
  displayName: string; // name with the "(or …)" alias stripped
  aliases: string[]; // parsed from "(or Mobius)" etc.
};

type Snapshot = {
  generatedAt: string;
  apiBase: string;
  sportId: number;
  count: number;
  tricks: TrickDetail[];
};

const SNAPSHOT = snapshotJson as Snapshot;

/** Extract a YouTube video id from a watch/short/embed URL, or null. */
export function youTubeId(uri: string): string | null {
  const m = uri.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

/**
 * Extract a YouTube start offset in whole seconds, or null. Handles the forms
 * that appear on share/deep links: `start=NN` (embed param) and `t=` / `#t=` as
 * either a plain number of seconds or a `1h2m3s` / `90s` duration. The API only
 * accepts integer seconds, so a duration is summed and a plain number floored.
 */
export function youTubeStart(uri: string): number | null {
  const m = uri.match(/[?&#](?:start|t)=([0-9hms]+)/i);
  if (!m) return null;
  const v = m[1];
  if (/^\d+$/.test(v)) return Number(v); // plain seconds
  const parts = v.match(/(\d+)\s*([hms])/gi);
  if (!parts) return null;
  let secs = 0;
  for (const p of parts) {
    const n = Number(p.match(/\d+/)![0]);
    const unit = p.slice(-1).toLowerCase();
    secs += unit === "h" ? n * 3600 : unit === "m" ? n * 60 : n;
  }
  return secs || null;
}

/** Extract a Vimeo numeric id from a vimeo URL, or null. */
export function vimeoId(uri: string): string | null {
  const m = uri.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export type ResolvedMedia =
  | { kind: "youtube"; embed: string; media: TrickMedia }
  | { kind: "vimeo"; embed: string; media: TrickMedia }
  | { kind: "photo"; src: string; media: TrickMedia }
  | { kind: "pdf"; href: string; media: TrickMedia };

/**
 * Classify each media item into something renderable, dropping anything we
 * can't place (e.g. an unrecognised URL). Order: embeds/photos first, PDFs last.
 */
export function resolveMedia(media: TrickMedia[]): ResolvedMedia[] {
  const out: ResolvedMedia[] = [];
  for (const m of media) {
    // Only ever emit http(s) media URLs. Blocks a malicious/typo'd API value
    // like a javascript: URI from becoming a photo src or PDF href.
    if (!/^https?:\/\//i.test(m.uri)) continue;

    const yt = youTubeId(m.uri);
    if (yt) {
      // Preserve a deep-link start time (e.g. ?start=18020 on a long stream) so
      // the clip opens at the trick, not at 0:00.
      const start = youTubeStart(m.uri);
      const embed = start
        ? `https://www.youtube-nocookie.com/embed/${yt}?start=${start}`
        : `https://www.youtube-nocookie.com/embed/${yt}`;
      out.push({ kind: "youtube", embed, media: m });
      continue;
    }
    const vim = vimeoId(m.uri);
    if (vim) {
      out.push({ kind: "vimeo", embed: `https://player.vimeo.com/video/${vim}`, media: m });
      continue;
    }
    if (m.mediaType === "Photo" || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(m.uri)) {
      out.push({ kind: "photo", src: m.uri, media: m });
      continue;
    }
    if (m.mediaType === "PDF" || /\.pdf(\?|$)/i.test(m.uri)) {
      out.push({ kind: "pdf", href: m.uri, media: m });
      continue;
    }
    // Unknown type — skip rather than render a broken frame.
  }
  // PDFs (document links) render after visual media.
  return out.sort((a, b) => (a.kind === "pdf" ? 1 : 0) - (b.kind === "pdf" ? 1 : 0));
}

/** Split "Back Mobe (or Mobius / Moby)" → { displayName, aliases }. */
export function parseAliases(name: string): {
  displayName: string;
  aliases: string[];
} {
  const match = name.match(/\(or\s+([^)]+)\)/i);
  if (!match) return { displayName: name.trim(), aliases: [] };
  const aliases = match[1]
    .split(/\s*(?:\/|,|\bor\b)\s*/i)
    .map((a) => a.trim())
    .filter(Boolean);
  const displayName = name.replace(match[0], "").replace(/\s{2,}/g, " ").trim();
  return { displayName, aliases };
}

/** URL-safe slug from the alias-stripped display name. */
export function toSlug(displayName: string): string {
  const s = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "trick";
}

/** Canonical trick path: /tricks/wkb{id}-{slug} (id is the stable ISBN). */
export function trickPath(trickId: number, slug: string): string {
  return `/tricks/wkb${trickId}-${slug}`;
}

/**
 * Serialize an object for embedding in a <script type="application/ld+json">
 * block via dangerouslySetInnerHTML. JSON.stringify does NOT escape <, >, & —
 * so a trick name/description containing "</script>" could break out and inject.
 * Escape those to their unicode forms (valid JSON, inert in HTML).
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/** Extract the trick id from a wkb{id}-{slug} route param. */
export function trickIdFromSlug(routeSlug: string): number | null {
  const m = routeSlug.match(/^wkb(\d+)/i);
  return m ? Number(m[1]) : null;
}

function enrich(detail: TrickDetail): Trick {
  const { displayName, aliases } = parseAliases(detail.name);
  return { ...detail, displayName, aliases, slug: toSlug(displayName) };
}

// All snapshot tricks minus the excluded (BB drill) entries.
const INCLUDED: TrickDetail[] = SNAPSHOT.tricks.filter(
  (t) => !isExcludedTrick(t.name),
);

/** The full wakeboard trick list (list-shape, excludes BB drills). */
export async function getAllTrickList(): Promise<TrickListItem[]> {
  return INCLUDED;
}

/** One trick's full detail, enriched with slug + aliases. Null if excluded/missing. */
export async function getTrick(trickId: number): Promise<Trick> {
  const detail = INCLUDED.find((t) => t.trickId === trickId);
  if (!detail) throw new Error(`Trick ${trickId} not in snapshot`);
  return enrich(detail);
}

/** All tricks with detail — for the index and for generateStaticParams. */
export async function getAllTricks(): Promise<Trick[]> {
  return INCLUDED.map(enrich).sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "en", { numeric: true }),
  );
}

/**
 * "Start here" — a hand-picked set of well-known, human-recognisable tricks by
 * WKB id (verified to exist). Ordered roughly foundational → iconic. Not a
 * popularity rank (no bag/search data yet) — just classics for first-time
 * visitors. Any id missing from the live data is skipped gracefully.
 */
export const CLASSIC_TRICK_IDS = [
  75, // Heelside Backroll
  62, // Toeside Backroll
  127, // Raley
  92, // Tantrum
  48, // Scarecrow
  49, // Elephant
  159, // Batwing
  101, // Whirlybird
  80, // KGB
  64, // Pete Rose
  50, // Crow Mobe
  128, // Blind Judge
  78, // Roll to Blind
  143, // S-Bend
  111, // Slim Chance
];

/** The classic tricks, in curated order, from an already-loaded set. */
export function pickClassics(all: Trick[]): Trick[] {
  const byId = new Map(all.map((t) => [t.trickId, t]));
  return CLASSIC_TRICK_IDS.map((id) => byId.get(id)).filter(
    (t): t is Trick => Boolean(t),
  );
}

/** First-letter group key for the A–Z index (non-letters bucket under "#"). */
export function alphaKey(displayName: string): string {
  const c = displayName.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

/**
 * Group an alphabetically-sorted trick list into A–Z sections. Returns groups
 * in order, plus the list of letters that actually have tricks (for jump links).
 */
export function groupAlphabetically(all: Trick[]): {
  groups: { letter: string; tricks: Trick[] }[];
  letters: string[];
} {
  const map = new Map<string, Trick[]>();
  for (const t of all) {
    const k = alphaKey(t.displayName);
    (map.get(k) ?? map.set(k, []).get(k)!).push(t);
  }
  // "#" first, then A–Z.
  const order = (k: string) => (k === "#" ? "" : k);
  const letters = [...map.keys()].sort((a, b) => order(a).localeCompare(order(b)));
  const groups = letters.map((letter) => ({ letter, tricks: map.get(letter)! }));
  return { groups, letters };
}
