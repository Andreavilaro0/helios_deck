/**
 * Tests for noaa-kp.server.ts — all run in memory, no real HTTP calls.
 *
 * Dependency injection:
 *   - fetcher: replaced with a function that returns hard-coded raw data
 *   - db: openDb(':memory:') — fresh per test, never touches helios.sqlite
 */

import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "~/db/db.server";
import { listSignals } from "~/services/signals.server";
import { ingestNoaaKpSignals } from "./noaa-kp.server";
import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Raw fixture — matches the real NOAA planetary_k_index_1m.json shape
// ---------------------------------------------------------------------------

const RAW_TWO_ENTRIES = [
  { time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: 0.33, kp: "0P" },
  { time_tag: "2026-04-29T16:27:00", kp_index: 1, estimated_kp: 0.67, kp: "1M" },
];

function fakeFetcher(raw: unknown): () => Promise<unknown> {
  return () => Promise.resolve(raw);
}

let db: Database.Database;

beforeEach(() => {
  db = openDb(":memory:");
});

// ---------------------------------------------------------------------------
// ingestNoaaKpSignals
// ---------------------------------------------------------------------------

describe("ingestNoaaKpSignals", () => {
  it("saves normalized signals to SQLite", async () => {
    await ingestNoaaKpSignals({ fetcher: fakeFetcher(RAW_TWO_ENTRIES), db });

    const saved = listSignals(db);
    expect(saved).toHaveLength(2);
    expect(saved[0].source).toBe("noaa-swpc");
    expect(saved[0].signal).toBe("kp-index");
  });

  it("returns correct fetched, saved, and skipped counts", async () => {
    const result = await ingestNoaaKpSignals({
      fetcher: fakeFetcher(RAW_TWO_ENTRIES),
      db,
    });

    expect(result.fetched).toBe(2);
    expect(result.saved).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("does not save duplicate signals already in the database", async () => {
    await ingestNoaaKpSignals({ fetcher: fakeFetcher(RAW_TWO_ENTRIES), db });
    const second = await ingestNoaaKpSignals({
      fetcher: fakeFetcher(RAW_TWO_ENTRIES),
      db,
    });

    expect(second.fetched).toBe(2);
    expect(second.saved).toBe(0);
    expect(second.skipped).toBe(2);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("saves only new entries when raw data partially overlaps with stored records", async () => {
    await ingestNoaaKpSignals({ fetcher: fakeFetcher([RAW_TWO_ENTRIES[0]]), db });

    const second = await ingestNoaaKpSignals({
      fetcher: fakeFetcher(RAW_TWO_ENTRIES),
      db,
    });

    expect(second.saved).toBe(1);
    expect(second.skipped).toBe(1);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("records a normalizer error when raw data is not an array", async () => {
    const result = await ingestNoaaKpSignals({
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

    const result = await ingestNoaaKpSignals({ fetcher: failingFetcher, db });

    expect(result.fetched).toBe(0);
    expect(result.saved).toBe(0);
    expect(result.errors[0]).toMatch(/network timeout/);
    expect(listSignals(db)).toHaveLength(0);
  });
});
