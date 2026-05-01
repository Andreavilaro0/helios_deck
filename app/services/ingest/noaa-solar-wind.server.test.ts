/**
 * Tests for noaa-solar-wind.server.ts — all run in memory, no real HTTP calls.
 *
 * Dependency injection:
 *   - fetcher: replaced with a function that returns hard-coded raw data
 *   - db: openDb(':memory:') — fresh per test, never touches helios.sqlite
 */

import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "~/db/db.server";
import { listSignals } from "~/services/signals.server";
import { ingestNoaaSolarWindSignals } from "./noaa-solar-wind.server";
import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Raw fixture — matches the real NOAA plasma-7-day.json shape (2D array)
// Row 0 = header, rows 1+ = data (all values are strings)
// ---------------------------------------------------------------------------

const HEADER = ["time_tag", "density", "speed", "temperature"];

const RAW_TWO_ENTRIES = [
  HEADER,
  ["2026-05-01 12:00:00.000", "5.2", "452.1", "87523"],
  ["2026-05-01 12:01:00.000", "5.4", "460.0", "88000"],
];

// Batch with one data-gap row (empty speed string) plus two valid rows
const RAW_WITH_GAP = [
  HEADER,
  ["2026-05-01 12:00:00.000", "5.2", "452.1", "87523"],
  ["2026-05-01 12:01:00.000", "5.4", "460.0", "88000"],
  ["2026-05-01 12:02:00.000", "", "", ""],
];

function fakeFetcher(raw: unknown): () => Promise<unknown> {
  return () => Promise.resolve(raw);
}

let db: Database.Database;

beforeEach(() => {
  db = openDb(":memory:");
});

// ---------------------------------------------------------------------------
// ingestNoaaSolarWindSignals
// ---------------------------------------------------------------------------

describe("ingestNoaaSolarWindSignals", () => {
  it("saves normalized signals to SQLite", async () => {
    await ingestNoaaSolarWindSignals({ fetcher: fakeFetcher(RAW_TWO_ENTRIES), db });

    const saved = listSignals(db);
    expect(saved).toHaveLength(2);
    expect(saved[0].source).toBe("noaa-swpc");
    expect(saved[0].signal).toBe("solar-wind-speed");
    expect(saved[0].unit).toBe("km/s");
  });

  it("returns correct fetched, saved, and skipped counts", async () => {
    const result = await ingestNoaaSolarWindSignals({
      fetcher: fakeFetcher(RAW_TWO_ENTRIES),
      db,
    });

    expect(result.fetched).toBe(2);
    expect(result.saved).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("does not count data-gap rows as fetched", async () => {
    const result = await ingestNoaaSolarWindSignals({
      fetcher: fakeFetcher(RAW_WITH_GAP),
      db,
    });

    // The empty-speed row is filtered by the normalizer before reaching ingest
    expect(result.fetched).toBe(2);
    expect(result.saved).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it("does not save duplicate signals already in the database", async () => {
    await ingestNoaaSolarWindSignals({ fetcher: fakeFetcher(RAW_TWO_ENTRIES), db });
    const second = await ingestNoaaSolarWindSignals({
      fetcher: fakeFetcher(RAW_TWO_ENTRIES),
      db,
    });

    expect(second.fetched).toBe(2);
    expect(second.saved).toBe(0);
    expect(second.skipped).toBe(2);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("saves only new entries when raw data partially overlaps with stored records", async () => {
    await ingestNoaaSolarWindSignals({
      fetcher: fakeFetcher([HEADER, RAW_TWO_ENTRIES[1]]),
      db,
    });

    const second = await ingestNoaaSolarWindSignals({
      fetcher: fakeFetcher(RAW_TWO_ENTRIES),
      db,
    });

    expect(second.saved).toBe(1);
    expect(second.skipped).toBe(1);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("records a normalizer error when raw data is not an array", async () => {
    const result = await ingestNoaaSolarWindSignals({
      fetcher: fakeFetcher({ not: "an array" }),
      db,
    });

    expect(result.fetched).toBe(0);
    expect(result.saved).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/expected array/i);
    expect(listSignals(db)).toHaveLength(0);
  });

  it("records a fetch error and saves nothing when the fetcher throws", async () => {
    const failingFetcher = () => Promise.reject(new Error("network timeout"));

    const result = await ingestNoaaSolarWindSignals({ fetcher: failingFetcher, db });

    expect(result.fetched).toBe(0);
    expect(result.saved).toBe(0);
    expect(result.errors[0]).toMatch(/network timeout/);
    expect(listSignals(db)).toHaveLength(0);
  });
});
