/**
 * Tests for noaa-proton-flux.server.ts — all run in memory, no real HTTP calls.
 *
 * Dependency injection:
 *   - fetcher: replaced with a function that returns hard-coded raw data
 *   - db: openDb(':memory:') — fresh per test, never touches helios.sqlite
 *
 * The NOAA integral-protons-6-hour.json endpoint returns one entry per timestamp
 * for each energy band. The proton flux normalizer filters for >=10 MeV only:
 *   ">=10 MeV" → signal: "proton-flux-10mev"
 * So one timestamp produces one distinct SignalRecordInput row (for the >=10 MeV channel).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "~/db/db.server";
import { listSignals } from "~/services/signals.server";
import { ingestNoaaProtonFluxSignals } from "./noaa-proton-flux.server";
import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Raw fixtures — match the real NOAA integral-protons-6-hour.json shape
// Only >=10 MeV entries (the normalizer filters to these)
// ---------------------------------------------------------------------------

const PROTON_T1 = [
  {
    time_tag: "2026-05-01T17:30:00Z",
    satellite: 18,
    flux: 1.077927589416504,
    energy: ">=10 MeV",
  },
];

const PROTON_TWO_TIMESTAMPS = [
  {
    time_tag: "2026-05-01T17:30:00Z",
    satellite: 18,
    flux: 1.077927589416504,
    energy: ">=10 MeV",
  },
  {
    time_tag: "2026-05-01T17:31:00Z",
    satellite: 18,
    flux: 0.8354623,
    energy: ">=10 MeV",
  },
];

function fakeFetcher(raw: unknown): () => Promise<unknown> {
  return () => Promise.resolve(raw);
}

let db: Database.Database;

beforeEach(() => {
  db = openDb(":memory:");
});

// ---------------------------------------------------------------------------
// ingestNoaaProtonFluxSignals
// ---------------------------------------------------------------------------

describe("ingestNoaaProtonFluxSignals", () => {
  it("saves normalized signal to SQLite", async () => {
    await ingestNoaaProtonFluxSignals({ fetcher: fakeFetcher(PROTON_T1), db });

    const saved = listSignals(db);
    expect(saved).toHaveLength(1);
    expect(saved[0].source).toBe("noaa-swpc");
    expect(saved[0].signal).toBe("proton-flux-10mev");
    expect(saved[0].unit).toBe("pfu");
  });

  it("returns correct fetched, saved, and skipped counts", async () => {
    const result = await ingestNoaaProtonFluxSignals({
      fetcher: fakeFetcher(PROTON_T1),
      db,
    });

    expect(result.fetched).toBe(1);
    expect(result.saved).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("does not save duplicate signals already in the database", async () => {
    await ingestNoaaProtonFluxSignals({ fetcher: fakeFetcher(PROTON_T1), db });
    const second = await ingestNoaaProtonFluxSignals({
      fetcher: fakeFetcher(PROTON_T1),
      db,
    });

    expect(second.fetched).toBe(1);
    expect(second.saved).toBe(0);
    expect(second.skipped).toBe(1);
    expect(listSignals(db)).toHaveLength(1);
  });

  it("saves only new entries when raw data partially overlaps", async () => {
    // First run: save >=10 MeV at T1 (1 record)
    await ingestNoaaProtonFluxSignals({
      fetcher: fakeFetcher(PROTON_T1),
      db,
    });

    // Second run: T1 (already stored) + T2 (new)
    const second = await ingestNoaaProtonFluxSignals({
      fetcher: fakeFetcher(PROTON_TWO_TIMESTAMPS),
      db,
    });

    expect(second.fetched).toBe(2);
    expect(second.saved).toBe(1);
    expect(second.skipped).toBe(1);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("records a normalizer error when raw data is not an array", async () => {
    const result = await ingestNoaaProtonFluxSignals({
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

    const result = await ingestNoaaProtonFluxSignals({
      fetcher: failingFetcher,
      db,
    });

    expect(result.fetched).toBe(0);
    expect(result.saved).toBe(0);
    expect(result.errors[0]).toMatch(/network timeout/);
    expect(listSignals(db)).toHaveLength(0);
  });
});
