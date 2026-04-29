/**
 * signals.server.ts — server-only data access for normalized signals.
 *
 * This is the boundary between the domain layer (SignalRecord) and the
 * persistence layer (SQLite). It is the only file that may import from app/db/.
 *
 * The `.server.ts` suffix excludes this file from the client bundle.
 * Call these functions only from loaders, actions, or other server-side code.
 *
 * All functions accept an optional `db` parameter so tests can inject an
 * in-memory database without touching the production singleton.
 */

import { randomUUID } from "node:crypto";
import { getDb } from "~/db/db.server";
import type {
  ISOTimestamp,
  SignalMetadata,
  SignalName,
  SignalRecord,
  SignalRecordInput,
  SignalSource,
  SignalUnit,
  SignalValue,
} from "~/types/signal";
import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Internal row type — what SQLite hands back before JSON parsing
// ---------------------------------------------------------------------------

interface SignalRow {
  id: string;
  timestamp: string;
  source: string;
  signal: string;
  value_json: string;
  unit: string;
  confidence: number;
  metadata_json: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Row → domain record conversion
// ---------------------------------------------------------------------------

function rowToRecord(row: SignalRow): SignalRecord {
  let value: SignalValue;
  try {
    value = JSON.parse(row.value_json) as SignalValue;
  } catch {
    throw new Error(
      `signals.server: value_json is not valid JSON (id=${row.id})`
    );
  }

  let metadata: SignalMetadata;
  try {
    metadata = JSON.parse(row.metadata_json) as SignalMetadata;
  } catch {
    throw new Error(
      `signals.server: metadata_json is not valid JSON (id=${row.id})`
    );
  }

  return {
    timestamp: row.timestamp as ISOTimestamp,
    source: row.source as SignalSource,
    signal: row.signal as SignalName,
    value,
    unit: row.unit as SignalUnit,
    confidence: row.confidence,
    metadata,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Persists a single normalized signal record.
 * Throws if confidence is out of [0, 1] or if value/metadata cannot be
 * serialized to JSON.
 */
export function saveSignal(
  input: SignalRecordInput,
  db: Database.Database = getDb()
): void {
  if (input.confidence < 0 || input.confidence > 1) {
    throw new Error(
      `saveSignal: confidence must be between 0 and 1, got ${input.confidence}`
    );
  }

  let value_json: string;
  try {
    value_json = JSON.stringify(input.value);
  } catch {
    throw new Error("saveSignal: value cannot be serialized to JSON");
  }

  let metadata_json: string;
  try {
    metadata_json = JSON.stringify(input.metadata ?? {});
  } catch {
    throw new Error("saveSignal: metadata cannot be serialized to JSON");
  }

  db.prepare(
    `INSERT INTO signals
       (id, timestamp, source, signal, value_json, unit, confidence, metadata_json, created_at)
     VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    input.timestamp,
    input.source,
    input.signal,
    value_json,
    input.unit,
    input.confidence,
    metadata_json,
    new Date().toISOString()
  );
}

/**
 * Returns all stored signals ordered by timestamp DESC (newest first).
 */
export function listSignals(
  db: Database.Database = getDb()
): SignalRecord[] {
  const rows = db
    .prepare("SELECT * FROM signals ORDER BY timestamp DESC")
    .all() as SignalRow[];
  return rows.map(rowToRecord);
}

/**
 * Returns the most recent record for a given signal name, or null if none.
 * ISO 8601 timestamps sort correctly as strings, so ORDER BY timestamp DESC works.
 */
export function getLatestSignalByName(
  signalName: SignalName,
  db: Database.Database = getDb()
): SignalRecord | null {
  const row = db
    .prepare(
      "SELECT * FROM signals WHERE signal = ? ORDER BY timestamp DESC LIMIT 1"
    )
    .get(signalName) as SignalRow | undefined;

  return row ? rowToRecord(row) : null;
}
