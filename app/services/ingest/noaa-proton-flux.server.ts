/**
 * noaa-proton-flux.server.ts — ingest coordinator for NOAA SWPC proton flux.
 *
 * Single responsibility: coordinate the pipeline.
 *   fetcher  → raw HTTP response
 *   normalizer → SignalRecordInput[] (one record per timestamp for >=10 MeV only)
 *   signals.server → persistence
 *
 * Unlike X-ray flux (which emits two records per timestamp — one for each channel),
 * the proton flux normalizer emits only one record per timestamp: the >=10 MeV flux.
 * All entries are deduplicated using { timestamp, source, signal }, so the >=10 MeV
 * entry at each timestamp is a single distinct row.
 *
 * Both `fetcher` and `db` are injectable so tests can run without network
 * calls or a real database file.
 */

import type Database from "better-sqlite3";
import { fetchProtonFlux } from "~/services/fetchers/noaa-swpc.server";
import { normalizeProtonFlux } from "~/services/normalizers/noaa-swpc";
import { saveSignal, signalExists } from "~/services/signals.server";
import { getDb } from "~/db/db.server";
import type { SignalRecordInput } from "~/types/signal";
import type { IngestResult } from "./noaa-kp.server";
export type { IngestResult } from "./noaa-kp.server";

export async function ingestNoaaProtonFluxSignals(options?: {
  fetcher?: () => Promise<unknown>;
  db?: Database.Database;
}): Promise<IngestResult> {
  const fetchFn = options?.fetcher ?? fetchProtonFlux;
  const db = options?.db ?? getDb();

  const result: IngestResult = {
    source: "noaa-swpc",
    signal: "proton-flux-10mev",
    fetched: 0,
    saved: 0,
    skipped: 0,
    errors: [],
  };

  let records: SignalRecordInput[] = [];
  try {
    const raw = await fetchFn();
    records = normalizeProtonFlux(raw);
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
