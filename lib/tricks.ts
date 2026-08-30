/**
 * Build-time trick data layer.
 *
 * Pages through the live trick API and fetches each trick's detail so the whole
 * index can be emitted as static HTML. Nothing here runs at request time — it
 * is called from generateStaticParams / server components during `next build`.
 *
 * API origin is the OKE backend the app itself uses. www.wakeboard.com/api is
 * NOT used: that domain points at Vercel (this landing), so it can't serve the
 * API. Override with TRICKS_API_BASE when api.wakeboard.com exists.
 */

import fs from "node:fs";
import path from "node:path";
import tls from "node:tls";
import { Agent, setGlobalDispatcher } from "undici";

const API_BASE =
  process.env.TRICKS_API_BASE?.replace(/\/$/, "") ??
  "https://www.wakeboard.co.uk/api/v1";

// The OKE ingress serves an incomplete TLS chain (leaf only, missing the Sectigo
// intermediate). Browsers/curl recover via AIA fetching; Node's fetch does not,
// so it rejects the cert during `next build`. Supply the intermediate explicitly
// alongside the system roots — this fixes verification WITHOUT disabling it.
// Remove once the ingress serves a full chain (or the API moves to api.wakeboard.com).
let dispatcherReady = false;
function ensureTlsTrust() {
  if (dispatcherReady) return;
  dispatcherReady = true;
  try {
    const pem = fs.readFileSync(
      path.join(process.cwd(), "certs", "sectigo-intermediate.pem"),
      "utf-8",
    );
    setGlobalDispatcher(
      new Agent({
        connect: { ca: [...tls.rootCertificates, pem] },
      }),
    );
  } catch {
    // If the cert file is missing, fall back to default trust; the fetch will
    // surface a clear TLS error rather than silently downgrading.
  }
}

// This domain only surfaces wakeboard tricks.
const SPORT_ID = 1;

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

async function getJson<T>(url: string): Promise<T> {
  ensureTlsTrust();
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // Static export: all fetches run at build time and must be treated as
    // static. "no-store" would mark the route dynamic and break the export.
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`Trick API ${res.status} for ${url}`);
  }
  return (await res.json()) as T;
}

/** Extract a YouTube video id from a watch/short/embed URL, or null. */
export function youTubeId(uri: string): string | null {
  const m = uri.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
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
    const yt = youTubeId(m.uri);
    if (yt) {
      out.push({
        kind: "youtube",
        embed: `https://www.youtube-nocookie.com/embed/${yt}`,
        media: m,
      });
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

/** Extract the trick id from a wkb{id}-{slug} route param. */
export function trickIdFromSlug(routeSlug: string): number | null {
  const m = routeSlug.match(/^wkb(\d+)/i);
  return m ? Number(m[1]) : null;
}

function enrich(detail: TrickDetail): Trick {
  const { displayName, aliases } = parseAliases(detail.name);
  return { ...detail, displayName, aliases, slug: toSlug(displayName) };
}

/** Page through the full wakeboard trick list. */
export async function getAllTrickList(): Promise<TrickListItem[]> {
  const pageSize = 100;
  const first = await getJson<{
    data: TrickListItem[];
    meta: { totalPages: number };
  }>(`${API_BASE}/tricks?page=1&pageSize=${pageSize}&sportId=${SPORT_ID}`);

  const items = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page++) {
    const next = await getJson<{ data: TrickListItem[] }>(
      `${API_BASE}/tricks?page=${page}&pageSize=${pageSize}&sportId=${SPORT_ID}`,
    );
    items.push(...next.data);
  }
  return items.filter((t) => !isExcludedTrick(t.name));
}

/** One trick's full detail, enriched with slug + aliases. */
export async function getTrick(trickId: number): Promise<Trick> {
  const detail = await getJson<TrickDetail>(`${API_BASE}/tricks/${trickId}`);
  return enrich(detail);
}

/** All tricks with detail — for the index and for generateStaticParams. */
export async function getAllTricks(): Promise<Trick[]> {
  const list = await getAllTrickList();
  const tricks = await Promise.all(list.map((t) => getTrick(t.trickId)));
  // Stable alphabetical order by display name for the index.
  return tricks.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "en", { numeric: true }),
  );
}

export { API_BASE };
