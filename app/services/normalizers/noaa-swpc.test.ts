/**
 * Tests for NOAA SWPC normalizers: Kp index, solar wind speed, and X-ray flux.
 *
 * Kp entry shape verified against live API on 2026-04-29:
 * { time_tag: "2026-04-29T16:26:00", kp_index: 0, estimated_kp: 0.33, kp: "0P" }
 *
 * Solar wind entry shape from plasma-7-day.json (verified 2026-05-01):
 * [["time_tag","density","speed","temperature"], ["2026-05-01 12:00:00.000","5.2","452.1","87523"], ...]
 */

import { describe, expect, it } from "vitest";
import { normalize, normalizeSolarWindSpeed, normalizeXRayFlux } from "./noaa-swpc";

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

// ---------------------------------------------------------------------------
// normalizeXRayFlux — fixtures
//
// Entry shapes verified against live NOAA xrays-6-hour.json (2026-05-01).
// Two entries share each timestamp: one per energy channel.
// ---------------------------------------------------------------------------

const XRAY_SHORT_ENTRY = {
  time_tag: "2026-05-01T16:11:00Z",
  satellite: 19,
  flux: 1.316572362242141e-8,
  observed_flux: 3.840084161765844e-8,
  electron_correction: 2.5235118883415453e-8,
  electron_contaminaton: true,
  energy: "0.05-0.4nm",
};

const XRAY_LONG_ENTRY = {
  time_tag: "2026-05-01T16:11:00Z",
  satellite: 19,
  flux: 1.0128478606930003e-6,
  observed_flux: 1.062917590388679e-6,
  electron_correction: 5.006974745924708e-8,
  electron_contaminaton: false,
  energy: "0.1-0.8nm",
};

// ---------------------------------------------------------------------------
// normalizeXRayFlux — valid input
// ---------------------------------------------------------------------------

describe("normalizeXRayFlux — valid input", () => {
  it("maps short-channel entry to signal='xray-flux-short'", () => {
    const [record] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    expect(record.signal).toBe("xray-flux-short");
  });

  it("maps long-channel entry to signal='xray-flux-long'", () => {
    const [record] = normalizeXRayFlux([XRAY_LONG_ENTRY]);
    expect(record.signal).toBe("xray-flux-long");
  });

  it("sets source='noaa-swpc' and unit='W/m²' for both channels", () => {
    const [short] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    const [long] = normalizeXRayFlux([XRAY_LONG_ENTRY]);
    expect(short.source).toBe("noaa-swpc");
    expect(short.unit).toBe("W/m²");
    expect(long.source).toBe("noaa-swpc");
    expect(long.unit).toBe("W/m²");
  });

  it("returns 2 records when both channels are in one batch", () => {
    const records = normalizeXRayFlux([XRAY_SHORT_ENTRY, XRAY_LONG_ENTRY]);
    expect(records).toHaveLength(2);
    expect(records[0].signal).toBe("xray-flux-short");
    expect(records[1].signal).toBe("xray-flux-long");
  });

  it("preserves Z suffix on time_tag without modification", () => {
    const [record] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    expect(record.timestamp).toBe("2026-05-01T16:11:00Z");
  });

  it("uses flux (electron-corrected) as the signal value, not observed_flux", () => {
    const [record] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    expect(record.value).toBe(XRAY_SHORT_ENTRY.flux);
    expect(record.value).not.toBe(XRAY_SHORT_ENTRY.observed_flux);
  });

  it("sets confidence to 0.9 for real-time provisional data", () => {
    const [record] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    expect(record.confidence).toBe(0.9);
  });

  it("includes satellite number in metadata", () => {
    const [record] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    expect(typeof record.metadata?.satellite).toBe("number");
    expect(record.metadata?.satellite).toBe(19);
  });

  it("includes observed_flux, electron_correction, electron_contaminaton, energy in metadata", () => {
    const [record] = normalizeXRayFlux([XRAY_SHORT_ENTRY]);
    expect(record.metadata?.observed_flux).toBe(XRAY_SHORT_ENTRY.observed_flux);
    expect(record.metadata?.electron_correction).toBe(
      XRAY_SHORT_ENTRY.electron_correction
    );
    // Preserves the API's typo in the key name ("contaminaton" not "contamination")
    expect(record.metadata?.electron_contaminaton).toBe(true);
    expect(record.metadata?.energy).toBe("0.05-0.4nm");
  });

  it("processes 4 entries (2 short + 2 long) and returns 4 records in order", () => {
    const XRAY_SHORT_ENTRY_2 = { ...XRAY_SHORT_ENTRY, time_tag: "2026-05-01T16:12:00Z" };
    const XRAY_LONG_ENTRY_2 = { ...XRAY_LONG_ENTRY, time_tag: "2026-05-01T16:12:00Z" };
    const records = normalizeXRayFlux([
      XRAY_SHORT_ENTRY,
      XRAY_LONG_ENTRY,
      XRAY_SHORT_ENTRY_2,
      XRAY_LONG_ENTRY_2,
    ]);
    expect(records).toHaveLength(4);
    expect(records[0].signal).toBe("xray-flux-short");
    expect(records[1].signal).toBe("xray-flux-long");
    expect(records[2].signal).toBe("xray-flux-short");
    expect(records[3].signal).toBe("xray-flux-long");
  });

  it("returns empty array for an empty input array", () => {
    expect(normalizeXRayFlux([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// normalizeXRayFlux — invalid input throws
// ---------------------------------------------------------------------------

describe("normalizeXRayFlux — invalid input throws", () => {
  it("throws when input is not an array", () => {
    expect(() => normalizeXRayFlux({ not: "an array" })).toThrow(
      /expected array/
    );
  });

  it("throws when entry is missing time_tag", () => {
    const { time_tag: _omitted, ...noTimeTag } = XRAY_SHORT_ENTRY;
    expect(() => normalizeXRayFlux([noTimeTag])).toThrow(/time_tag/);
  });

  it("throws when entry has non-string time_tag", () => {
    expect(() =>
      normalizeXRayFlux([{ ...XRAY_SHORT_ENTRY, time_tag: 20260501 }])
    ).toThrow(/time_tag/);
  });

  it("throws when energy string is unrecognised", () => {
    expect(() =>
      normalizeXRayFlux([{ ...XRAY_SHORT_ENTRY, energy: "0.1-0.3nm" }])
    ).toThrow(/energy/);
  });

  it("throws when flux is not a number", () => {
    expect(() =>
      normalizeXRayFlux([{ ...XRAY_SHORT_ENTRY, flux: "1.3e-8" }])
    ).toThrow(/flux/);
  });

  it("throws when flux is NaN", () => {
    expect(() =>
      normalizeXRayFlux([{ ...XRAY_SHORT_ENTRY, flux: NaN }])
    ).toThrow(/flux/);
  });

  it("throws when flux is Infinity", () => {
    expect(() =>
      normalizeXRayFlux([{ ...XRAY_SHORT_ENTRY, flux: Infinity }])
    ).toThrow(/flux/);
  });

  it("throws when flux field is missing entirely", () => {
    const { flux: _omitted, ...noFlux } = XRAY_SHORT_ENTRY;
    expect(() => normalizeXRayFlux([noFlux])).toThrow(/flux/);
  });

  it("throws when top-level input is null", () => {
    expect(() => normalizeXRayFlux(null)).toThrow(/expected array/);
  });
});

// ---------------------------------------------------------------------------
// normalizeXRayFlux — metadata edge cases
// ---------------------------------------------------------------------------

describe("normalizeXRayFlux — metadata edge cases", () => {
  it("preserves electron_contaminaton: false (not dropped as falsy)", () => {
    const [record] = normalizeXRayFlux([XRAY_LONG_ENTRY]);
    expect(record.metadata?.electron_contaminaton).toBe(false);
  });
});
