/**
 * noaa-xray-flux.server.ts — ingest coordinator for NOAA SWPC X-ray flux.
 *
 * Single responsibility: coordinate the pipeline.
 *   fetcher  → raw HTTP response
 *   normalizer → SignalRecordInput[] (one record per channel per timestamp)
 *   signals.server → persistence
 *
 * The normalizer emits two records per timestamp — one for "xray-flux-short"
 * (0.05-0.4 nm) and one for "xray-flux-long" (0.1-0.8 nm). The dedup check
 * uses { timestamp, source, signal }, so both channels at the same timestamp
 * are treated as independent entries.
 *
 * Both `fetcher` and `db` are injectable so tests can run without network
 * calls or a real database file.
 */

import type Database from "better-sqlite3";
import { fetchXRayFlux } from "~/services/fetchers/noaa-swpc.server";
import { normalizeXRayFlux } from "~/services/normalizers/noaa-swpc";
import { saveSignal, signalExists } from "~/services/signals.server";
import { getDb } from "~/db/db.server";
import type { SignalRecordInput } from "~/types/signal";
import type { IngestResult } from "./noaa-kp.server";
export type { IngestResult } from "./noaa-kp.server";

export async function ingestNoaaXRayFluxSignals(options?: {
  fetcher?: () => Promise<unknown>;
  db?: Database.Database;
}): Promise<IngestResult> {
  const fetchFn = options?.fetcher ?? fetchXRayFlux;
  const db = options?.db ?? getDb();

  const result: IngestResult = {
    source: "noaa-swpc",
    // "xray-flux-long" is the representative channel name in the summary log.
    // Both channels (xray-flux-short and xray-flux-long) are actually ingested —
    // the per-record signal field in each saved SignalRecord is authoritative.
    signal: "xray-flux-long",
    fetched: 0,
    saved: 0,
    skipped: 0,
    errors: [],
  };

  let records: SignalRecordInput[] = [];
  try {
    const raw = await fetchFn();
    records = normalizeXRayFlux(raw);
    result.fetched = records.length;
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err));
    return result;
  }

  for (const record of records) {
    try {
      if (
        signalExists(
          { timestamp: record.timestamp, source: record.source, signal: record.signal },
          db
        )
      ) {
        result.skipped++;
        continue;
      }
      saveSignal(record, db);
      result.saved++;
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : String(err));
      result.skipped++;
    }
  }

  return result;
}
