/**
 * scripts/ingest-noaa-solar-wind.ts — manual ingest trigger for development.
 *
 * Runs the full NOAA solar wind pipeline: fetcher → normalizer → SQLite.
 * Uses the production database at data/helios.sqlite (or DATABASE_PATH env var).
 *
 * Usage:
 *   npm run ingest:noaa-solar-wind
 *
 * console.info / console.error are intentional here — this is a CLI script,
 * not application code. Services never call console directly.
 */

import { ingestNoaaSolarWindSignals } from "../app/services/ingest/noaa-solar-wind.server";

async function main(): Promise<void> {
  console.info("[helios] Fetching NOAA SWPC solar wind speed...");

  const result = await ingestNoaaSolarWindSignals();

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
