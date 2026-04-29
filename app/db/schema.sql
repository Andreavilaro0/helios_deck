-- HELIOS_DECK — canonical signals schema
-- This file mirrors the inline SQL in db.server.ts.
-- In a future migration phase, tooling will read this file directly.
-- If you change one, change the other.

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

-- Composite indices: the two most common query patterns are
-- "latest reading of signal X" and "all readings from source Y in range".
CREATE INDEX IF NOT EXISTS idx_signals_signal_timestamp
  ON signals (signal, timestamp);

CREATE INDEX IF NOT EXISTS idx_signals_source_timestamp
  ON signals (source, timestamp);
