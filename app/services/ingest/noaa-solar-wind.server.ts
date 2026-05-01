/**
 * noaa-solar-wind.server.ts — ingest coordinator for NOAA SWPC solar wind speed.
 *
 * Single responsibility: coordinate the pipeline.
 *   fetcher  → raw HTTP response
 *   normalizer → SignalRecordInput[]
 *   signals.server → persistence
 *
 * Both `fetcher` and `db` are injectable so tests can run without
 * network calls or a real database file.
 */

import type Database from "better-sqlite3";
import { fetchSolarWindSpeed } from "~/services/fetchers/noaa-swpc.server";
import { normalizeSolarWindSpeed } from "~/services/normalizers/noaa-swpc";
import { saveSignal, signalExists } from "~/services/signals.server";
import { getDb } from "~/db/db.server";
import type { SignalName, SignalRecordInput, SignalSource } from "~/types/signal";

export interface IngestResult {
  source: SignalSource;
  signal: SignalName;
  fetched: number;
  saved: number;
  skipped: number;
  errors: string[];
}

export async function ingestNoaaSolarWindSignals(options?: {
  fetcher?: () => Promise<unknown>;
  db?: Database.Database;
}): Promise<IngestResult> {
  const fetchFn = options?.fetcher ?? fetchSolarWindSpeed;
  const db = options?.db ?? getDb();

  const result: IngestResult = {
    source: "noaa-swpc",
    signal: "solar-wind-speed",
    fetched: 0,
    saved: 0,
    skipped: 0,
    errors: [],
  };

  let records: SignalRecordInput[] = [];
  try {
    const raw = await fetchFn();
    records = normalizeSolarWindSpeed(raw);
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
