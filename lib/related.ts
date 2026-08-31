import type { Trick } from "./tricks";

/**
 * Deterministic "related tricks" — computed at build time from data we already
 * have, no AI/LLM. Three signals, highest-weight first:
 *
 *   1. Switch ↔ base pair        ("Switch Back Mobe" ↔ "Back Mobe")      — w 4
 *   2. Same spin family          ("Crow Mobe" ↔ "Crow Mobe 540/720/…")   — w 3
 *   3. Description cross-ref      (a description names another trick)     — w 2
 *
 * A richer semantic/taxonomy layer (inverts vs spins, difficulty tiers,
 * learn-before ordering) is a good future agentic pass — this covers the
 * mechanical ~80% that's correct-by-construction and strengthens internal
 * linking for SEO. Everything here renders as static <a> links.
 */

const SPIN_SUFFIX = /\s*(?:1080|900|720|540|360|180|[57])$/;

function spinRoot(displayName: string): string {
  return displayName.replace(SPIN_SUFFIX, "").trim();
}

export type RelatedTrick = {
  trickId: number;
  displayName: string;
  slug: string;
};

/**
 * Rank related tricks for `target` against the full set. Returns up to `limit`,
 * de-duplicated, never including the trick itself.
 */
export function relatedTricks(
  target: Trick,
  all: Trick[],
  limit = 6,
): RelatedTrick[] {
  const scores = new Map<number, number>();
  const add = (id: number, w: number) => {
    if (id === target.trickId) return;
    scores.set(id, (scores.get(id) ?? 0) + w);
  };

  const targetLower = target.displayName.toLowerCase();
  const isSwitch = /^switch /i.test(target.displayName);
  const base = isSwitch ? target.displayName.replace(/^switch /i, "") : null;
  const switchName = `switch ${target.displayName}`;
  const targetRoot = spinRoot(target.displayName).toLowerCase();
  // Bare single-word surface roots ("Heelside", "Toeside") are too generic to
  // be a useful family anchor on their own.
  const rootIsGeneric = !targetRoot.includes(" ") && targetRoot === targetLower;

  // Longest names first so "Back Mobe 540" is matched before "Back Mobe".
  const byLength = [...all].sort(
    (a, b) => b.displayName.length - a.displayName.length,
  );

  const desc = (target.description ?? "").toLowerCase();

  for (const o of all) {
    const oLower = o.displayName.toLowerCase();

    // 1) switch ↔ base
    if (base && oLower === base.toLowerCase()) add(o.trickId, 4);
    if (!isSwitch && oLower === switchName.toLowerCase()) add(o.trickId, 4);

    // 2) same spin family — but not when the shared root is a bare surface word
    if (!rootIsGeneric && spinRoot(o.displayName).toLowerCase() === targetRoot) {
      add(o.trickId, 3);
    }
  }

  // 3) this description names another trick. Skip bare single-word surface
  //    tricks ("Heelside", "Toeside") — their name appears in almost every
  //    description, so they're noise rather than a useful relation.
  for (const o of byLength) {
    if (o.trickId === target.trickId) continue;
    const oName = o.displayName;
    const isBareSurface = !oName.includes(" ") && oName.length <= 8;
    if (isBareSurface) continue;
    if (oName.length > 4 && desc.includes(oName.toLowerCase())) {
      add(o.trickId, 2);
    }
  }

  const byId = new Map(all.map((t) => [t.trickId, t]));
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, limit)
    .map(([id]) => {
      const t = byId.get(id)!;
      return { trickId: t.trickId, displayName: t.displayName, slug: t.slug };
    });
}
