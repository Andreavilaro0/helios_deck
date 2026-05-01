// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolarWindPanel, interpretWindSpeed } from "./SolarWindPanel";
import type { SignalRecord } from "~/types/signal";

function makeSignal(speed: number): SignalRecord {
  return {
    timestamp: "2026-05-01T12:00:00Z",
    source: "noaa-swpc",
    signal: "solar-wind-speed",
    value: speed,
    unit: "km/s",
    confidence: 0.9,
    metadata: { proton_density: 5.2, proton_temperature: 87523 },
  };
}

// ---------------------------------------------------------------------------
// interpretWindSpeed — pure function, no DOM needed
// ---------------------------------------------------------------------------

describe("interpretWindSpeed", () => {
  it("returns CALM for speed below 400", () => {
    expect(interpretWindSpeed(350)).toBe("CALM");
    expect(interpretWindSpeed(0)).toBe("CALM");
    expect(interpretWindSpeed(399.9)).toBe("CALM");
  });

  it("returns ELEVATED for speed between 400 and 600 inclusive", () => {
    expect(interpretWindSpeed(400)).toBe("ELEVATED");
    expect(interpretWindSpeed(500)).toBe("ELEVATED");
    expect(interpretWindSpeed(600)).toBe("ELEVATED");
  });

  it("returns HIGH SPEED STREAM for speed above 600", () => {
    expect(interpretWindSpeed(601)).toBe("HIGH SPEED STREAM");
    expect(interpretWindSpeed(800)).toBe("HIGH SPEED STREAM");
  });

  it("returns UNKNOWN for non-numeric value", () => {
    expect(interpretWindSpeed("fast")).toBe("UNKNOWN");
    expect(interpretWindSpeed(null)).toBe("UNKNOWN");
    expect(interpretWindSpeed(undefined)).toBe("UNKNOWN");
  });
});

// ---------------------------------------------------------------------------
// SolarWindPanel — rendering
// ---------------------------------------------------------------------------

describe("SolarWindPanel", () => {
  it("renders speed value formatted to 1 decimal place", () => {
    render(<SolarWindPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("452.1")).toBeInTheDocument();
  });

  it("renders the unit km/s", () => {
    render(<SolarWindPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("km/s")).toBeInTheDocument();
  });

  it("shows CALM status for speed below 400", () => {
    render(<SolarWindPanel signal={makeSignal(350)} />);
    expect(screen.getByTestId("wind-status")).toHaveTextContent("CALM");
  });

  it("shows ELEVATED status for speed between 400 and 600", () => {
    render(<SolarWindPanel signal={makeSignal(500)} />);
    expect(screen.getByTestId("wind-status")).toHaveTextContent("ELEVATED");
  });

  it("shows HIGH SPEED STREAM status for speed above 600", () => {
    render(<SolarWindPanel signal={makeSignal(650)} />);
    expect(screen.getByTestId("wind-status")).toHaveTextContent("HIGH SPEED STREAM");
  });

  it("renders source label", () => {
    render(<SolarWindPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("noaa-swpc")).toBeInTheDocument();
  });

  it("renders confidence as a percentage", () => {
    render(<SolarWindPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("renders the panel title", () => {
    render(<SolarWindPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText(/Solar Wind/i)).toBeInTheDocument();
  });
});
