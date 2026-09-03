/**
 * Trick-family colour coding for the landing trick cards.
 *
 * The landing site is logged-out and its tricks carry no per-user status
 * (Learning/Landed/Consistent) — so we can't reuse trickdex-web's status
 * colours directly. Instead we infer a loose "family" from the trick name and
 * colour it with the app's own palette, applied as a left-accent bar (see
 * TrickCard). This gives the long A–Z list the app's colour-coded feel while
 * staying purely presentational — a wrong guess only mis-tints a stripe.
 */

export type Accent = { border: string; label: string };

// Neutral (no family matched) — the default slate card border.
const NEUTRAL: Accent = { border: "#e2e8f0", label: "" };

/**
 * Inferred family → accent, using the app's palette. First match wins, so
 * ORDER MATTERS: more specific / overriding families are listed first. e.g.
 * "blind / wrapped" is tested before "invert / flip" so "Roll to Blind" reads
 * as blind, not as a plain roll. Matched on the display name only (descriptions
 * reference other tricks and cause false positives).
 */
const FAMILIES: { test: RegExp; accent: Accent }[] = [
  // Handle-pass spins: Mobe/Mobius, and big rotation numbers (720+).
  { test: /\bmob(e|ius)\b|\b(7|9)\d{2}\b|1080/i, accent: { border: "#7c3aed", label: "handle-pass / spin" } },
  // Blind / wrapped landings — check before roll/flip so "* to Blind" wins.
  { test: /\bblind\b|\bwrap\b|\bol[ée]\b/i,       accent: { border: "#d97706", label: "blind / wrapped" } },
  // Raley family and its descendants.
  { test: /\b(raley|batwing|whirlybird|hoochie)\b/i, accent: { border: "#db2777", label: "raley family" } },
  // Inverts / flips.
  { test: /\b(roll|backroll|tantrum|scarecrow|s-?bend|elephant)\b/i, accent: { border: "#16a34a", label: "invert / flip" } },
  // Grabs.
  { test: /\b(grab|indy|melon|method|stalefish|nuclear)\b/i, accent: { border: "#0891b2", label: "grab" } },
];

/**
 * Family accent for a trick, or a neutral border when nothing matches. Takes
 * just the display name so both full Trick and lighter RelatedTrick objects
 * (which only carry displayName) can be coloured.
 */
export function accentByFamily(trick: { displayName: string }): Accent {
  for (const f of FAMILIES) if (f.test.test(trick.displayName)) return f.accent;
  return NEUTRAL;
}
