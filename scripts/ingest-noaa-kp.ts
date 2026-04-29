/**
 * scripts/ingest-noaa-kp.ts — manual ingest trigger for development.
 *
 * Runs the full NOAA Kp pipeline: fetcher → normalizer → SQLite.
 * Uses the production database at data/helios.sqlite (or DATABASE_PATH env var).
 *
 * Usage:
 *   npm run ingest:noaa-kp
 *
 * console.info / console.error are intentional here — this is a CLI script,
 * not application code. Services never call console directly.
 */

import { ingestNoaaKpSignals } from "../app/services/ingest/noaa-kp.server";

async function main(): Promise<void> {
  console.info("[helios] Fetching NOAA SWPC Kp index...");

  const result = await ingestNoaaKpSignals();

  console.info(
    `[helios] source=${result.source} signal=${result.signal} ` +
      `fetched=${result.fetched} saved=${result.saved} ` +
      `skipped=${result.skipped} errors=${result.errors.length}`
  );

  if (result.errors.length > 0) {
    console.error("[helios] Errors:");
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(
    "[helios] Fatal:",
    err instanceof Error ? err.message : String(err)
  );
  process.exit(1);
});
