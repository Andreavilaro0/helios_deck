/**
 * Tests for signals.server.ts — all run against an in-memory SQLite database.
 * Each test gets a fresh database via openDb(':memory:') in beforeEach.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "~/db/db.server";
import type Database from "better-sqlite3";
import {
  getLatestSignalByName,
  listSignals,
  saveSignal,
  signalExists,
} from "./signals.server";
import type { SignalRecordInput } from "~/types/signal";

// ---------------------------------------------------------------------------
// Test fixture — a minimal valid NOAA Kp record
// ---------------------------------------------------------------------------

const VALID_INPUT: SignalRecordInput = {
  timestamp: "2026-04-29T16:26:00Z",
  source: "noaa-swpc",
  signal: "kp-index",
  value: 0.33,
  unit: "index",
  confidence: 0.9,
  metadata: { kp_index: 0, kp_class: "0P" },
};

let db: Database.Database;

beforeEach(() => {
  db = openDb(":memory:");
});

// ---------------------------------------------------------------------------
// saveSignal
// ---------------------------------------------------------------------------

describe("saveSignal", () => {
  it("persists a valid signal without throwing", () => {
    expect(() => saveSignal(VALID_INPUT, db)).not.toThrow();
    expect(listSignals(db)).toHaveLength(1);
  });

  it("throws when confidence is less than 0", () => {
    expect(() => saveSignal({ ...VALID_INPUT, confidence: -0.1 }, db)).toThrow(
      /confidence/
    );
  });

  it("throws when confidence is greater than 1", () => {
    expect(() => saveSignal({ ...VALID_INPUT, confidence: 1.1 }, db)).toThrow(
      /confidence/
    );
  });

  it("accepts confidence at boundary values 0 and 1", () => {
    expect(() => saveSignal({ ...VALID_INPUT, confidence: 0 }, db)).not.toThrow();
    expect(() => saveSignal({ ...VALID_INPUT, confidence: 1 }, db)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// listSignals
// ---------------------------------------------------------------------------

describe("listSignals", () => {
  it("returns an empty array when no signals have been saved", () => {
    expect(listSignals(db)).toEqual([]);
  });

  it("returns all saved signals", () => {
    saveSignal(VALID_INPUT, db);
    saveSignal({ ...VALID_INPUT, timestamp: "2026-04-29T16:27:00Z" }, db);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("returns signals ordered by timestamp descending (newest first)", () => {
    saveSignal({ ...VALID_INPUT, timestamp: "2026-04-29T16:26:00Z" }, db);
    saveSignal({ ...VALID_INPUT, timestamp: "2026-04-29T16:27:00Z" }, db);
    const records = listSignals(db);
    expect(records[0].timestamp).toBe("2026-04-29T16:27:00Z");
    expect(records[1].timestamp).toBe("2026-04-29T16:26:00Z");
  });
});

// ---------------------------------------------------------------------------
// getLatestSignalByName
// ---------------------------------------------------------------------------

describe("getLatestSignalByName", () => {
  it("returns null when no signal with that name exists", () => {
    expect(getLatestSignalByName("kp-index", db)).toBeNull();
  });

  it("returns the most recent record for the given signal name", () => {
    saveSignal({ ...VALID_INPUT, timestamp: "2026-04-29T16:26:00Z" }, db);
    saveSignal({ ...VALID_INPUT, timestamp: "2026-04-29T16:27:00Z" }, db);
    const record = getLatestSignalByName("kp-index", db);
    expect(record?.timestamp).toBe("2026-04-29T16:27:00Z");
  });

  it("does not return records of a different signal name", () => {
    saveSignal({ ...VALID_INPUT, signal: "solar-wind-speed", unit: "km/s" }, db);
    expect(getLatestSignalByName("kp-index", db)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signalExists
// ---------------------------------------------------------------------------

describe("signalExists", () => {
  it("returns false when the database is empty", () => {
    expect(
      signalExists(
        { timestamp: VALID_INPUT.timestamp, source: "noaa-swpc", signal: "kp-index" },
        db
      )
    ).toBe(false);
  });

  it("returns true after the matching signal is saved", () => {
    saveSignal(VALID_INPUT, db);
    expect(
      signalExists(
        { timestamp: VALID_INPUT.timestamp, source: "noaa-swpc", signal: "kp-index" },
        db
      )
    ).toBe(true);
  });

  it("returns false when timestamp differs", () => {
    saveSignal(VALID_INPUT, db);
    expect(
      signalExists(
        { timestamp: "2026-04-29T00:00:00Z", source: "noaa-swpc", signal: "kp-index" },
        db
      )
    ).toBe(false);
  });

  it("returns false when source differs", () => {
    saveSignal(VALID_INPUT, db);
    expect(
      signalExists(
        { timestamp: VALID_INPUT.timestamp, source: "gfz-potsdam", signal: "kp-index" },
        db
      )
    ).toBe(false);
  });

  it("returns false when signal name differs", () => {
    saveSignal(VALID_INPUT, db);
    expect(
      signalExists(
        { timestamp: VALID_INPUT.timestamp, source: "noaa-swpc", signal: "solar-wind-speed" },
        db
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON roundtrip — value and metadata must come back parsed, not as raw strings
// ---------------------------------------------------------------------------

describe("JSON roundtrip", () => {
  it("recovers value as a number, not a string", () => {
    saveSignal(VALID_INPUT, db);
    const [record] = listSignals(db);
    expect(typeof record.value).toBe("number");
    expect(record.value).toBe(0.33);
  });

  it("recovers metadata as an object with the original keys and values", () => {
    saveSignal(VALID_INPUT, db);
    const [record] = listSignals(db);
    expect(typeof record.metadata).toBe("object");
    expect(record.metadata.kp_index).toBe(0);
    expect(record.metadata.kp_class).toBe("0P");
  });

  it("recovers a structured (object) value correctly", () => {
    const structured: SignalRecordInput = {
      ...VALID_INPUT,
      signal: "kp-index",
      value: { lat: 51.5, lon: -0.1 },
    };
    saveSignal(structured, db);
    const [record] = listSignals(db);
    expect(record.value).toEqual({ lat: 51.5, lon: -0.1 });
  });
});
