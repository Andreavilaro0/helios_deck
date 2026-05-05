// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getSignalFreshness } from "./signal-freshness";
import type { SignalRecord } from "~/types/signal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSignal(
  signalName: SignalRecord["signal"],
  minutesAgo: number,
  now: Date
): SignalRecord {
  const ts = new Date(now.getTime() - minutesAgo * 60_000);
  return {
    timestamp: ts.toISOString(),
    source: "noaa-swpc",
    signal: signalName,
    value: 1,
    unit: "index",
    confidence: 0.9,
    metadata: {},
  };
}

const FIXED_NOW = new Date("2026-05-02T12:00:00Z");

// ---------------------------------------------------------------------------
// Missing state — null signal
// ---------------------------------------------------------------------------

describe("getSignalFreshness — missing (null signal)", () => {
  it("returns status missing", () => {
    expect(getSignalFreshness(null, FIXED_NOW).status).toBe("missing");
  });

  it("returns ageMinutes null", () => {
    expect(getSignalFreshness(null, FIXED_NOW).ageMinutes).toBeNull();
  });

  it("returns label NO DATA", () => {
    expect(getSignalFreshness(null, FIXED_NOW).label).toBe("NO DATA");
  });
});

// ---------------------------------------------------------------------------
// Missing state — invalid timestamp
// ---------------------------------------------------------------------------

describe("getSignalFreshness — missing (invalid timestamp)", () => {
  const badTimestamp: SignalRecord = {
    timestamp: "not-a-date",
    source: "noaa-swpc",
    signal: "kp-index",
    value: 3,
    unit: "index",
    confidence: 0.9,
    metadata: {},
  };

  it("returns status missing for invalid timestamp", () => {
    expect(getSignalFreshness(badTimestamp, FIXED_NOW).status).toBe("missing");
  });

  it("returns ageMinutes null for invalid timestamp", () => {
    expect(getSignalFreshness(badTimestamp, FIXED_NOW).ageMinutes).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// kp-index — threshold 180 minutes
// ---------------------------------------------------------------------------

describe("getSignalFreshness — kp-index (threshold 180 min)", () => {
  it("returns fresh when age is 60 min (well under threshold)", () => {
    const signal = makeSignal("kp-index", 60, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("fresh");
  });

  it("returns fresh when age equals threshold exactly (boundary)", () => {
    const signal = makeSignal("kp-index", 180, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("fresh");
  });

  it("returns stale when age is 181 min (one minute over threshold)", () => {
    const signal = makeSignal("kp-index", 181, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("stale");
  });

  it("returns stale when age is 360 min (2× threshold)", () => {
    const signal = makeSignal("kp-index", 360, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// xray-flux-long — threshold 30 minutes
// ---------------------------------------------------------------------------

describe("getSignalFreshness — xray-flux-long (threshold 30 min)", () => {
  it("returns fresh when age is 10 min", () => {
    const signal = makeSignal("xray-flux-long", 10, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("fresh");
  });

  it("returns stale when age is 31 min", () => {
    const signal = makeSignal("xray-flux-long", 31, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// solar-wind-speed — threshold 60 minutes
// ---------------------------------------------------------------------------

describe("getSignalFreshness — solar-wind-speed (threshold 60 min)", () => {
  it("returns fresh when age is 30 min", () => {
    const signal = makeSignal("solar-wind-speed", 30, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("fresh");
  });

  it("returns stale when age is 90 min", () => {
    const signal = makeSignal("solar-wind-speed", 90, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// proton-flux-10mev — threshold 60 minutes
// ---------------------------------------------------------------------------

describe("getSignalFreshness — proton-flux-10mev (threshold 60 min)", () => {
  it("returns fresh when age is 45 min", () => {
    const signal = makeSignal("proton-flux-10mev", 45, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("fresh");
  });

  it("returns stale when age is 61 min", () => {
    const signal = makeSignal("proton-flux-10mev", 61, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// Unknown signal name falls back to 60-minute default
// ---------------------------------------------------------------------------

describe("getSignalFreshness — unknown signal (dst-index, default 60 min)", () => {
  it("returns fresh when age is 30 min", () => {
    const signal = makeSignal("dst-index", 30, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("fresh");
  });

  it("returns stale when age is 90 min", () => {
    const signal = makeSignal("dst-index", 90, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).status).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// ageMinutes accuracy
// ---------------------------------------------------------------------------

describe("getSignalFreshness — ageMinutes", () => {
  it("returns correct ageMinutes for a 90-minute-old signal", () => {
    const signal = makeSignal("solar-wind-speed", 90, FIXED_NOW);
    const result = getSignalFreshness(signal, FIXED_NOW);
    expect(result.ageMinutes).toBeCloseTo(90, 1);
  });

  it("returns correct ageMinutes for a 5-minute-old signal", () => {
    const signal = makeSignal("kp-index", 5, FIXED_NOW);
    const result = getSignalFreshness(signal, FIXED_NOW);
    expect(result.ageMinutes).toBeCloseTo(5, 1);
  });
});

// ---------------------------------------------------------------------------
// Label values
// ---------------------------------------------------------------------------

describe("getSignalFreshness — label", () => {
  it("returns FRESH label when status is fresh", () => {
    const signal = makeSignal("kp-index", 60, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).label).toBe("FRESH");
  });

  it("returns STALE label when status is stale", () => {
    const signal = makeSignal("kp-index", 200, FIXED_NOW);
    expect(getSignalFreshness(signal, FIXED_NOW).label).toBe("STALE");
  });

  it("returns NO DATA label when status is missing", () => {
    expect(getSignalFreshness(null, FIXED_NOW).label).toBe("NO DATA");
  });
});
