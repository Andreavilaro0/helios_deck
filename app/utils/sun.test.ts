// app/utils/sun.test.ts
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { getSunsetTime, getSunriseTime, minutesUntilSunset } from "./sun";

describe("getSunsetTime", () => {
  it("returns HH:MM string for Reykjavik in summer", () => {
    // June 21 — midnight sun area, sunset very late
    const result = getSunsetTime(64.1355, -21.8954, new Date("2026-06-21"));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns HH:MM string for London", () => {
    const result = getSunsetTime(51.5074, -0.1278, new Date("2026-05-11"));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    // London sunset in May is roughly 20:00–21:00 UTC
    const [h] = result.split(":").map(Number);
    expect(h).toBeGreaterThanOrEqual(19);
    expect(h).toBeLessThanOrEqual(22);
  });

  it("returns a valid time for equator on equinox", () => {
    const result = getSunsetTime(0, 0, new Date("2026-03-20"));
    expect(result).toMatch(/^18:\d{2}$/); // ~18:00 UTC at equator/prime meridian
  });
});

describe("minutesUntilSunset", () => {
  it("returns positive number when sunset is in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T12:00:00Z")); // noon UTC
    const result = minutesUntilSunset("14:00", new Date()); // 2 hours in future
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it("returns null when sunset has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T12:00:00Z")); // noon UTC
    const result = minutesUntilSunset("00:00", new Date()); // midnight is past
    expect(result).toBeNull();
    vi.useRealTimers();
  });
});

describe("getSunriseTime", () => {
  it("returns HH:MM string for London in May", () => {
    const result = getSunriseTime(51.5074, -0.1278, new Date("2026-05-11"));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    // London sunrise in May is roughly 04:00–05:00 UTC
    const [h] = result.split(":").map(Number);
    expect(h).toBeGreaterThanOrEqual(3);
    expect(h).toBeLessThanOrEqual(6);
  });
});
