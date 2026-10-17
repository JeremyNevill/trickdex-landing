/**
 * Client-side trick search scoring.
 *
 * The catalog stays static HTML. TrickSearch ranks the cards that are already
 * on the page: exact name and alias hits outrank a description that merely
 * mentions the word, and a small edit distance catches misspellings
 * ("railey" → Raley) without fuzzy-matching the description text.
 */

export type SearchFields = {
  name: string;
  aliases: string[];
  misspellings: string[];
  description: string;
  wkb: string;
  trickId: number;
};

const SCORE = {
  exactWkb: 1000,
  exactName: 960,
  exactAlias: 940,
  nameContains: 800,
  aliasContains: 760,
  fuzzyName: 700,
  fuzzyAlias: 680,
  fuzzyToken: 620,
  wkbContains: 400,
  description: 200,
} as const;

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Damerau–Levenshtein distance (adjacent transposition counts as one edit).
 * Used for short name/alias comparisons only.
 */
export function damerauLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

/** How many edits a query of this length may be from a name or alias. */
export function fuzzyLimit(queryLength: number): number {
  if (queryLength < 4) return 0;
  if (queryLength <= 6) return 1;
  return 2;
}

function tokensOf(value: string): string[] {
  return value.split(" ").filter((token) => token.length > 0);
}

function within(query: string, candidate: string, limit: number): number | null {
  if (limit <= 0) return null;
  if (Math.abs(candidate.length - query.length) > limit) return null;
  const distance = damerauLevenshtein(query, candidate);
  return distance > 0 && distance <= limit ? distance : null;
}

/**
 * Rank a trick against a query. Higher is better. `null` means no match.
 * Description text is substring-only — fuzzy matching stays on names and
 * aliases so a misspelling does not light up every trick that mentions the
 * correctly spelled word.
 */
export function scoreSearch(query: string, fields: SearchFields): number | null {
  const q = normalizeSearch(query);
  if (!q) return null;

  const name = normalizeSearch(fields.name);
  const aliases = fields.aliases.map(normalizeSearch).filter(Boolean);
  const misspellings = fields.misspellings.map(normalizeSearch).filter(Boolean);
  const aliasTerms = [...aliases, ...misspellings];
  const description = normalizeSearch(fields.description);
  const wkb = fields.wkb.toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = String(fields.trickId);
  const compact = q.replace(/ /g, "");
  const limit = fuzzyLimit(compact.length);

  let best = 0;

  if (compact === wkb || compact === id) {
    best = Math.max(best, SCORE.exactWkb);
  } else if (
    (compact.length >= 2 && wkb.includes(compact)) ||
    (q.length >= 2 && id.includes(q))
  ) {
    best = Math.max(best, SCORE.wkbContains);
  }

  if (name === q) best = Math.max(best, SCORE.exactName);
  if (aliasTerms.some((alias) => alias === q)) best = Math.max(best, SCORE.exactAlias);

  if (q.length >= 2 && name.includes(q)) best = Math.max(best, SCORE.nameContains);
  if (q.length >= 2 && aliasTerms.some((alias) => alias.includes(q))) {
    best = Math.max(best, SCORE.aliasContains);
  }

  const nameDistance = within(q, name, limit);
  if (nameDistance != null) best = Math.max(best, SCORE.fuzzyName - nameDistance);
  for (const alias of aliasTerms) {
    const distance = within(q, alias, limit);
    if (distance != null) best = Math.max(best, SCORE.fuzzyAlias - distance);
  }

  const pool = [...tokensOf(name), ...aliasTerms.flatMap(tokensOf)];
  for (const token of pool) {
    if (token.length < 3) continue;
    const distance = within(q, token, limit);
    if (distance != null) best = Math.max(best, SCORE.fuzzyToken - distance);
  }

  // "back mobius" — every query word hits a name or alias word.
  if (q.includes(" ")) {
    const qTokens = tokensOf(q);
    const covered = qTokens.every((qt) => {
      if (pool.some((token) => token === qt || (qt.length >= 2 && token.includes(qt)))) return true;
      return pool.some((token) => token.length >= 3 && within(qt, token, fuzzyLimit(qt.length)) != null);
    });
    if (covered && qTokens.length > 0) best = Math.max(best, SCORE.aliasContains - 20);
  }

  if (q.length >= 2 && description.includes(q)) best = Math.max(best, SCORE.description);

  return best > 0 ? best : null;
}
