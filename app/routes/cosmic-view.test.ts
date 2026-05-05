import { describe, it, expect, vi } from "vitest";

vi.mock("~/services/signals.server", () => ({
  getLatestSignalByName: vi.fn(),
  listRecentSignalsByName: vi.fn().mockReturnValue([]),
}));

import { loader } from "./cosmic-view";
import { getLatestSignalByName } from "~/services/signals.server";

const MOCK_SIGNAL = {
  timestamp: "2026-04-29T16:00:00Z",
  source: "noaa-swpc" as const,
  signal: "kp-index" as const,
  value: 3.33,
  unit: "index" as const,
  confidence: 0.9,
  metadata: {},
};

describe("cosmic-view loader", () => {
  it("returns latestSignal when data exists", () => {
    vi.mocked(getLatestSignalByName).mockReturnValue(MOCK_SIGNAL);
    const result = loader({} as never);
    expect(result.latestSignal).toEqual(MOCK_SIGNAL);
    expect(getLatestSignalByName).toHaveBeenCalledWith("kp-index");
  });

  it("returns null when no data exists", () => {
    vi.mocked(getLatestSignalByName).mockReturnValue(null);
    const result = loader({} as never);
    expect(result.latestSignal).toBeNull();
  });
});
