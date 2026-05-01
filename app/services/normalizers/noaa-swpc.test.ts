/**
 * Tests for NOAA SWPC normalizers: Kp index and solar wind speed.
 *
 * Kp entry shape verified against live API on 2026-04-29:
 * { time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: 0.33, kp: "0P" }
 *
 * Solar wind entry shape from rtsw_wind.json:
 * { time_tag: "2026-05-01 12:00:00.000", proton_speed: 452.1, proton_density: 5.2, ... }
 */

import { describe, expect, it } from "vitest";
import { normalize, normalizeSolarWindSpeed } from "./noaa-swpc";

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

// ---------------------------------------------------------------------------
// normalizeSolarWindSpeed — valid input
//
// Real response format (verified 2026-05-01):
//   [["time_tag","density","speed","temperature"], ["2026-05-01 12:00:00.000","5.2","452.1","87523"], ...]
// Row 0 = header. All data values are strings.
// ---------------------------------------------------------------------------

const HEADER_ROW = ["time_tag", "density", "speed", "temperature"];
const VALID_WIND_ROW = ["2026-05-01 12:00:00.000", "5.2", "452.1", "87523"];
const VALID_WIND_BATCH = [HEADER_ROW, VALID_WIND_ROW];

describe("normalizeSolarWindSpeed — valid input", () => {
  it("returns one record for a valid batch", () => {
    expect(normalizeSolarWindSpeed(VALID_WIND_BATCH)).toHaveLength(1);
  });

  it("sets source, signal, and unit", () => {
    const [record] = normalizeSolarWindSpeed(VALID_WIND_BATCH);
    expect(record.source).toBe("noaa-swpc");
    expect(record.signal).toBe("solar-wind-speed");
    expect(record.unit).toBe("km/s");
  });

  it("parses speed string as the signal value", () => {
    const [record] = normalizeSolarWindSpeed(VALID_WIND_BATCH);
    expect(record.value).toBe(452.1);
  });

  it("converts space-separated time_tag to ISO 8601 UTC", () => {
    const [record] = normalizeSolarWindSpeed(VALID_WIND_BATCH);
    expect(record.timestamp).toBe("2026-05-01T12:00:00Z");
    expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("also handles T-separated time_tag", () => {
    const batch = [HEADER_ROW, ["2026-05-01T12:00:00", "5.2", "452.1", "87523"]];
    const [record] = normalizeSolarWindSpeed(batch);
    expect(record.timestamp).toBe("2026-05-01T12:00:00Z");
  });

  it("sets confidence to 0.9", () => {
    const [record] = normalizeSolarWindSpeed(VALID_WIND_BATCH);
    expect(record.confidence).toBe(0.9);
  });

  it("includes density and temperature in metadata", () => {
    const [record] = normalizeSolarWindSpeed(VALID_WIND_BATCH);
    expect(record.metadata?.proton_density).toBe(5.2);
    expect(record.metadata?.proton_temperature).toBe(87523);
  });

  it("processes multiple data rows in order", () => {
    const batch = [
      HEADER_ROW,
      VALID_WIND_ROW,
      ["2026-05-01 12:01:00.000", "5.4", "460.0", "88000"],
    ];
    const records = normalizeSolarWindSpeed(batch);
    expect(records).toHaveLength(2);
    expect(records[0].value).toBe(452.1);
    expect(records[1].value).toBe(460.0);
  });

  it("filters out rows with empty speed string (data gap)", () => {
    const batch = [
      HEADER_ROW,
      VALID_WIND_ROW,
      ["2026-05-01 12:01:00.000", "", "", ""],
      ["2026-05-01 12:02:00.000", "5.3", "455.0", "86000"],
    ];
    const records = normalizeSolarWindSpeed(batch);
    expect(records).toHaveLength(2);
    expect(records[0].value).toBe(452.1);
    expect(records[1].value).toBe(455.0);
  });

  it("returns empty array when all rows are data gaps", () => {
    const batch = [
      HEADER_ROW,
      ["2026-05-01 12:00:00.000", "", "", ""],
      ["2026-05-01 12:01:00.000", "", "", ""],
    ];
    expect(normalizeSolarWindSpeed(batch)).toHaveLength(0);
  });

  it("returns empty array for header-only batch", () => {
    expect(normalizeSolarWindSpeed([HEADER_ROW])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// normalizeSolarWindSpeed — invalid input throws
// ---------------------------------------------------------------------------

describe("normalizeSolarWindSpeed — invalid input throws", () => {
  it("throws when input is not an array", () => {
    expect(() => normalizeSolarWindSpeed({ not: "an array" })).toThrow(
      /expected array/
    );
  });

  it("throws when row 0 is not an array (missing header)", () => {
    expect(() => normalizeSolarWindSpeed([{ not: "array" }])).toThrow(
      /header/
    );
  });

  it("throws when header is missing time_tag column", () => {
    expect(() =>
      normalizeSolarWindSpeed([["density", "speed", "temperature"], VALID_WIND_ROW])
    ).toThrow(/time_tag/);
  });

  it("throws when header is missing speed column", () => {
    expect(() =>
      normalizeSolarWindSpeed([["time_tag", "density", "temperature"], VALID_WIND_ROW])
    ).toThrow(/speed/);
  });

  it("throws when a data row time_tag is not a string", () => {
    expect(() =>
      normalizeSolarWindSpeed([HEADER_ROW, [12345678, "5.2", "452.1", "87523"]])
    ).toThrow(/time_tag/);
  });

  it("throws when speed is a non-numeric string", () => {
    expect(() =>
      normalizeSolarWindSpeed([HEADER_ROW, ["2026-05-01 12:00:00.000", "5.2", "fast", "87523"]])
    ).toThrow(/speed/);
  });

  it("throws when speed string parses to NaN", () => {
    expect(() =>
      normalizeSolarWindSpeed([HEADER_ROW, ["2026-05-01 12:00:00.000", "5.2", "NaN", "87523"]])
    ).toThrow(/speed/);
  });

  it("throws when speed string parses to Infinity", () => {
    expect(() =>
      normalizeSolarWindSpeed([HEADER_ROW, ["2026-05-01 12:00:00.000", "5.2", "Infinity", "87523"]])
    ).toThrow(/speed/);
  });
});
