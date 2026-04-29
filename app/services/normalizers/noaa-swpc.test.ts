/**
 * Tests for the NOAA SWPC Kp index normalizer.
 *
 * Entry shape verified against live API on 2026-04-29:
 * { time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: 0.33, kp: "0P" }
 */

import { describe, expect, it } from "vitest";
import { normalize } from "./noaa-swpc";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_ENTRY = {
  time_tag: "2026-04-29T16:26:00",
  kp_index: 0,
  estimated_kp: 0.33,
  kp: "0P",
};

// ---------------------------------------------------------------------------
// Valid input
// ---------------------------------------------------------------------------

describe("normalize — NOAA SWPC Kp index — valid input", () => {
  it("returns one record per entry", () => {
    expect(normalize([VALID_ENTRY])).toHaveLength(1);
  });

  it("sets source, signal, and unit", () => {
    const [record] = normalize([VALID_ENTRY]);
    expect(record.source).toBe("noaa-swpc");
    expect(record.signal).toBe("kp-index");
    expect(record.unit).toBe("index");
  });

  it("uses estimated_kp as the signal value", () => {
    const [record] = normalize([VALID_ENTRY]);
    expect(record.value).toBe(0.33);
  });

  it("appends Z to produce an ISO 8601 UTC timestamp", () => {
    const [record] = normalize([VALID_ENTRY]);
    expect(record.timestamp).toBe("2026-04-29T16:26:00Z");
    expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("sets confidence to 0.9 (provisional real-time data)", () => {
    const [record] = normalize([VALID_ENTRY]);
    expect(record.confidence).toBe(0.9);
    expect(record.confidence).toBeGreaterThanOrEqual(0);
    expect(record.confidence).toBeLessThanOrEqual(1);
  });

  it("stores kp_index (number) and kp_class (string) in metadata", () => {
    const [record] = normalize([VALID_ENTRY]);
    expect(record.metadata).toBeDefined();
    expect(typeof record.metadata?.kp_index).toBe("number");
    expect(typeof record.metadata?.kp_class).toBe("string");
    expect(record.metadata?.kp_index).toBe(0);
    expect(record.metadata?.kp_class).toBe("0P");
  });

  it("processes multiple entries in order", () => {
    const two = [
      VALID_ENTRY,
      { time_tag: "2026-04-29T16:27:00", kp_index: 1, estimated_kp: 0.67, kp: "1M" },
    ];
    const records = normalize(two);
    expect(records).toHaveLength(2);
    expect(records[0].value).toBe(0.33);
    expect(records[1].value).toBe(0.67);
  });
});

// ---------------------------------------------------------------------------
// Invalid entries — normalizer must throw a clear error, never return garbage
// ---------------------------------------------------------------------------

describe("normalize — NOAA SWPC Kp index — invalid entries throw", () => {
  it("throws when time_tag is missing", () => {
    expect(() =>
      normalize([{ kp_index: 0, estimated_kp: 0.33, kp: "0P" }])
    ).toThrow(/time_tag/);
  });

  it("throws when time_tag is not a string", () => {
    expect(() =>
      normalize([{ time_tag: 12345, kp_index: 0, estimated_kp: 0.33, kp: "0P" }])
    ).toThrow(/time_tag/);
  });

  it("throws when estimated_kp is missing", () => {
    expect(() =>
      normalize([{ time_tag: "2026-04-29T16:26:00", kp_index: 0, kp: "0P" }])
    ).toThrow(/estimated_kp/);
  });

  it("throws when estimated_kp is NaN", () => {
    expect(() =>
      normalize([{ time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: NaN, kp: "0P" }])
    ).toThrow(/estimated_kp/);
  });

  it("throws when estimated_kp is Infinity", () => {
    expect(() =>
      normalize([
        { time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: Infinity, kp: "0P" },
      ])
    ).toThrow(/estimated_kp/);
  });

  it("throws when estimated_kp is not a number", () => {
    expect(() =>
      normalize([{ time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: "bad", kp: "0P" }])
    ).toThrow(/estimated_kp/);
  });
});
