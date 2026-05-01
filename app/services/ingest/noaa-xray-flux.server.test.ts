/**
 * Tests for noaa-xray-flux.server.ts — all run in memory, no real HTTP calls.
 *
 * Dependency injection:
 *   - fetcher: replaced with a function that returns hard-coded raw data
 *   - db: openDb(':memory:') — fresh per test, never touches helios.sqlite
 *
 * The NOAA xrays-6-hour.json endpoint returns two entries per timestamp:
 *   "0.05-0.4nm" → signal: "xray-flux-short"
 *   "0.1-0.8nm"  → signal: "xray-flux-long"
 * So one timestamp produces two distinct SignalRecordInput rows.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "~/db/db.server";
import { listSignals } from "~/services/signals.server";
import { ingestNoaaXRayFluxSignals } from "./noaa-xray-flux.server";
import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Raw fixtures — match the real NOAA xrays-6-hour.json shape
// Two entries per timestamp (one short channel, one long channel)
// ---------------------------------------------------------------------------

const HEADER_XRAY_RAW = [
  {
    time_tag: "2026-05-01T16:11:00Z",
    satellite: 19,
    flux: 1.316572362242141e-8,
    observed_flux: 3.840084161765844e-8,
    electron_correction: 2.5235118883415453e-8,
    electron_contaminaton: true,
    energy: "0.05-0.4nm",
  },
  {
    time_tag: "2026-05-01T16:11:00Z",
    satellite: 19,
    flux: 1.0128478606930003e-6,
    observed_flux: 1.062917590388679e-6,
    electron_correction: 5.006974745924708e-8,
    electron_contaminaton: false,
    energy: "0.1-0.8nm",
  },
];

const RAW_TWO_TIMESTAMPS = [
  ...HEADER_XRAY_RAW,
  {
    time_tag: "2026-05-01T16:12:00Z",
    satellite: 19,
    flux: 1.274934e-8,
    observed_flux: 3.849376e-8,
    electron_correction: 2.574442e-8,
    electron_contaminaton: true,
    energy: "0.05-0.4nm",
  },
  {
    time_tag: "2026-05-01T16:12:00Z",
    satellite: 19,
    flux: 1.012848e-6,
    observed_flux: 1.062918e-6,
    electron_correction: 5.003484e-8,
    electron_contaminaton: false,
    energy: "0.1-0.8nm",
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
// ingestNoaaXRayFluxSignals
// ---------------------------------------------------------------------------

describe("ingestNoaaXRayFluxSignals", () => {
  it("saves normalized signals to SQLite", async () => {
    await ingestNoaaXRayFluxSignals({ fetcher: fakeFetcher(HEADER_XRAY_RAW), db });

    const saved = listSignals(db);
    expect(saved).toHaveLength(2);
    expect(saved[0].source).toBe("noaa-swpc");
    expect(saved[0].unit).toBe("W/m²");
    // Both channels are saved; check at least one is a known xray signal name
    const signalNames = saved.map((r) => r.signal);
    expect(signalNames).toContain("xray-flux-short");
    expect(signalNames).toContain("xray-flux-long");
  });

  it("returns correct fetched, saved, and skipped counts", async () => {
    const result = await ingestNoaaXRayFluxSignals({
      fetcher: fakeFetcher(HEADER_XRAY_RAW),
      db,
    });

    expect(result.fetched).toBe(2);
    expect(result.saved).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("does not save duplicate signals already in the database", async () => {
    await ingestNoaaXRayFluxSignals({ fetcher: fakeFetcher(HEADER_XRAY_RAW), db });
    const second = await ingestNoaaXRayFluxSignals({
      fetcher: fakeFetcher(HEADER_XRAY_RAW),
      db,
    });

    expect(second.fetched).toBe(2);
    expect(second.saved).toBe(0);
    expect(second.skipped).toBe(2);
    expect(listSignals(db)).toHaveLength(2);
  });

  it("saves only new entries when raw data partially overlaps", async () => {
    // First run: save both channels at T1 (2 records)
    await ingestNoaaXRayFluxSignals({
      fetcher: fakeFetcher(HEADER_XRAY_RAW),
      db,
    });

    // Second run: T1 (both channels, already stored) + T2 (both channels, new)
    const second = await ingestNoaaXRayFluxSignals({
      fetcher: fakeFetcher(RAW_TWO_TIMESTAMPS),
      db,
    });

    expect(second.fetched).toBe(4);
    expect(second.saved).toBe(2);
    expect(second.skipped).toBe(2);
    expect(listSignals(db)).toHaveLength(4);
  });

  it("records a normalizer error when raw data is not an array", async () => {
    const result = await ingestNoaaXRayFluxSignals({
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

    const result = await ingestNoaaXRayFluxSignals({ fetcher: failingFetcher, db });

    expect(result.fetched).toBe(0);
    expect(result.saved).toBe(0);
    expect(result.errors[0]).toMatch(/network timeout/);
    expect(listSignals(db)).toHaveLength(0);
  });
});
