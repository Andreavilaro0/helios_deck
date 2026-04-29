/**
 * signals.server.ts — server-only data access for signals.
 *
 * The `.server.ts` suffix tells React Router's bundler to exclude this file
 * from the client bundle. These functions must only be called from loaders,
 * actions, or other server-side code.
 *
 * Current status: PLACEHOLDER — not implemented.
 * SQLite integration is Phase 1B. Do not add mock data here.
 *
 * Implementation will use better-sqlite3 (see docs/decisions.md ADR-003).
 * Schema is defined in docs/architecture.md and will live in app/db/schema.ts.
 */

import type { SignalName, SignalRecord, SignalRecordInput } from "~/types/signal";

const NOT_IMPLEMENTED = "signals.server.ts is not implemented yet";

/**
 * Returns all stored signals, newest first.
 * Phase 1B: will query the `signals` table ordered by timestamp DESC.
 */
export async function listSignals(): Promise<SignalRecord[]> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Returns the most recent record for a given signal name, or null if none exists.
 * Phase 1B: will query `SELECT * FROM signals WHERE signal = ? ORDER BY timestamp DESC LIMIT 1`.
 */
export async function getLatestSignalByName(
  signalName: SignalName
): Promise<SignalRecord | null> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Persists a single normalized signal record to the DB.
 * Phase 1B: will INSERT into the `signals` table.
 * The DB assigns `id` and `created_at` — neither is part of SignalRecordInput.
 */
export async function saveSignal(input: SignalRecordInput): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}
