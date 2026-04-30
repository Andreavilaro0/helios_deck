// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissionStatusPanel } from "./MissionStatusPanel";

const DEFAULT_PROPS = {
  source: "noaa-swpc",
  recordCount: 60,
  maxKp: 5.33,
  minKp: 1.0,
  avgKp: 2.51,
};

describe("MissionStatusPanel", () => {
  it("shows the source", () => {
    render(<MissionStatusPanel {...DEFAULT_PROPS} />);
    expect(screen.getByText("noaa-swpc")).toBeInTheDocument();
  });

  it("shows the reading count", () => {
    render(<MissionStatusPanel {...DEFAULT_PROPS} />);
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("shows pipeline steps", () => {
    render(<MissionStatusPanel {...DEFAULT_PROPS} />);
    expect(screen.getByText("NOAA SWPC")).toBeInTheDocument();
    expect(screen.getByText("SQLite")).toBeInTheDocument();
    expect(screen.getByText("SSR")).toBeInTheDocument();
  });

  it("shows max, min and avg Kp", () => {
    render(<MissionStatusPanel {...DEFAULT_PROPS} />);
    expect(screen.getByText("5.33")).toBeInTheDocument();
    expect(screen.getByText("1.00")).toBeInTheDocument();
    expect(screen.getByText("2.51")).toBeInTheDocument();
  });
});
