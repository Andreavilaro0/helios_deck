/**
 * db.server.ts — SQLite connection factory.
 *
 * Two exported functions:
 *   openDb(path)  — creates a new connection, runs the schema, returns it.
 *                   Used in tests to get a fresh in-memory DB per test.
 *   getDb()       — returns the singleton connection for production/dev use.
 *                   Path defaults to data/helios.sqlite; override with DATABASE_PATH env var.
 *
 * The schema SQL here mirrors app/db/schema.sql — keep them in sync.
 */

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Mirrors app/db/schema.sql — update both if the schema changes.
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS signals (
    id            TEXT NOT NULL,
    timestamp     TEXT NOT NULL CHECK(length(timestamp)     > 0),
    source        TEXT NOT NULL CHECK(length(source)        > 0),
    signal        TEXT NOT NULL CHECK(length(signal)        > 0),
    value_json    TEXT NOT NULL CHECK(length(value_json)    > 0),
    unit          TEXT NOT NULL,
    confidence    REAL NOT NULL CHECK(confidence >= 0.0 AND confidence <= 1.0),
    metadata_json TEXT NOT NULL CHECK(length(metadata_json) > 0),
    created_at    TEXT NOT NULL,
    PRIMARY KEY (id)
  );

  CREATE INDEX IF NOT EXISTS idx_signals_signal_timestamp
    ON signals (signal, timestamp);

  CREATE INDEX IF NOT EXISTS idx_signals_source_timestamp
    ON signals (source, timestamp);
`;

export function openDb(dbPath: string): Database.Database {
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  const db = new Database(dbPath);
  db.exec(SCHEMA_SQL);
  return db;
}

let _instance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_instance) {
    const dbPath =
      process.env["DATABASE_PATH"] ??
      path.join(process.cwd(), "data", "helios.sqlite");
    _instance = openDb(dbPath);
  }
  return _instance;
}
