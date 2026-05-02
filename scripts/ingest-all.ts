/**
 * scripts/ingest-all.ts — single command to populate all four signals.
 *
 * Runs each NOAA SWPC pipeline sequentially and prints a unified summary.
 * Use this to prepare the local database for a demo in one step:
 *
 *   npm run ingest:all
 *
 * Sequential (not parallel) so that a network failure on one signal
 * does not silently suppress errors from the others. Each result is
 * reported individually; exit code 1 if any pipeline had errors.
 *
 * console.info / console.error are intentional — this is a CLI script.
 */

import { ingestNoaaKpSignals } from "../app/services/ingest/noaa-kp.server";
import { ingestNoaaSolarWindSignals } from "../app/services/ingest/noaa-solar-wind.server";
import { ingestNoaaXRayFluxSignals } from "../app/services/ingest/noaa-xray-flux.server";
import { ingestNoaaProtonFluxSignals } from "../app/services/ingest/noaa-proton-flux.server";
import type { IngestResult } from "../app/services/ingest/noaa-kp.server";

const SIGNALS: Array<{ label: string; run: () => Promise<IngestResult> }> = [
  { label: "kp-index", run: ingestNoaaKpSignals },
  { label: "solar-wind-speed", run: ingestNoaaSolarWindSignals },
  { label: "xray-flux-long", run: ingestNoaaXRayFluxSignals },
  { label: "proton-flux-10mev", run: ingestNoaaProtonFluxSignals },
];

function formatResult(result: IngestResult): string {
  return (
    `fetched=${result.fetched} saved=${result.saved} ` +
    `skipped=${result.skipped} errors=${result.errors.length}`
  );
}

async function main(): Promise<void> {
  console.info("[helios] ingest:all — fetching all four NOAA signals\n");

  const results: Array<{ label: string; result: IngestResult }> = [];
  let anyErrors = false;

  for (const { label, run } of SIGNALS) {
    console.info(`[helios] → ${label}...`);
    try {
      const result = await run();
      results.push({ label, result });
      if (result.errors.length > 0) {
        anyErrors = true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[helios] ✗ ${label}: fatal — ${message}`);
      anyErrors = true;
      // Push a synthetic result so the summary table stays aligned
      results.push({
        label,
        result: {
          source: "noaa-swpc",
          signal: label as IngestResult["signal"],
          fetched: 0,
          saved: 0,
          skipped: 0,
          errors: [message],
        },
      });
    }
  }

  console.info("\n[helios] ── Summary ─────────────────────────────────────");
  for (const { label, result } of results) {
    const status = result.errors.length > 0 ? "✗" : "✓";
    console.info(`  ${status}  ${label.padEnd(22)} ${formatResult(result)}`);
    for (const err of result.errors) {
      console.error(`       error: ${err}`);
    }
  }
  console.info("[helios] ─────────────────────────────────────────────────\n");

  if (anyErrors) {
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
