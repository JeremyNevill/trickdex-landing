/**
 * Snapshot the live trick data to data/tricks.json.
 *
 * The site builds from this committed snapshot, NOT from a live API call — so
 * `next build` (locally and on Vercel) never needs network access. Re-run this
 * whenever the trick data changes:
 *
 *   npm run snapshot
 *
 * This is the ONLY place that talks to the API. The build reads the JSON.
 */

import fs from "node:fs";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import { Agent, setGlobalDispatcher } from "undici";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const API_BASE =
  process.env.TRICKS_API_BASE?.replace(/\/$/, "") ??
  "https://www.wakeboard.co.uk/api/v1";
const SPORT_ID = 1;

// The OKE ingress serves an incomplete TLS chain (leaf only, missing the Sectigo
// intermediate). Supply the intermediate alongside the system roots so Node's
// fetch verifies the chain without disabling verification.
try {
  const pem = fs.readFileSync(
    path.join(ROOT, "certs", "sectigo-intermediate.pem"),
    "utf-8",
  );
  setGlobalDispatcher(new Agent({ connect: { ca: [...tls.rootCertificates, pem] } }));
} catch {
  console.warn("! sectigo intermediate cert not found — relying on system trust");
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Trick API ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  const pageSize = 100;
  const first = await getJson(
    `${API_BASE}/tricks?page=1&pageSize=${pageSize}&sportId=${SPORT_ID}`,
  );
  const list = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page++) {
    const next = await getJson(
      `${API_BASE}/tricks?page=${page}&pageSize=${pageSize}&sportId=${SPORT_ID}`,
    );
    list.push(...next.data);
  }
  console.log(`Fetched ${list.length} tricks (list). Fetching detail…`);

  // Fetch each trick's full detail (media, landedByCount).
  const details = [];
  for (const t of list) {
    details.push(await getJson(`${API_BASE}/tricks/${t.trickId}`));
  }

  const snapshot = {
    // Stamp is informational only; the build does not depend on it.
    generatedAt: new Date().toISOString(),
    apiBase: API_BASE,
    sportId: SPORT_ID,
    count: details.length,
    tricks: details,
  };

  const outDir = path.join(ROOT, "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "tricks.json");
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Wrote ${details.length} tricks to ${path.relative(ROOT, outFile)}`);
}

main().catch((err) => {
  console.error("Snapshot failed:", err.message);
  process.exit(1);
});
