// app/utils/space-impact.test.ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getSpaceWeatherImpact } from "./space-impact";

describe("getSpaceWeatherImpact", () => {
  it("returns all LOW for quiet Kp < 4", () => {
    const r = getSpaceWeatherImpact(1.5);
    expect(r.radioBlackout).toBe("LOW");
    expect(r.solarRadiation).toBe("LOW");
    expect(r.geomagneticStorm).toBe("LOW");
  });

  it("returns MODERATE geomagnetic at Kp 4", () => {
    const r = getSpaceWeatherImpact(4.2);
    expect(r.geomagneticStorm).toBe("MODERATE");
    expect(r.radioBlackout).toBe("LOW");
  });

  it("returns HIGH geomagnetic at Kp 5", () => {
    const r = getSpaceWeatherImpact(5.5);
    expect(r.geomagneticStorm).toBe("HIGH");
  });

  it("returns HIGH for radio/radiation and geomagnetic at Kp 7", () => {
    const r = getSpaceWeatherImpact(7);
    expect(r.radioBlackout).toBe("MODERATE");
    expect(r.solarRadiation).toBe("HIGH");
    expect(r.geomagneticStorm).toBe("HIGH");
  });

  it("returns SEVERE at Kp >= 8", () => {
    const r = getSpaceWeatherImpact(9);
    expect(r.geomagneticStorm).toBe("SEVERE");
    expect(r.solarRadiation).toBe("SEVERE");
  });
});
