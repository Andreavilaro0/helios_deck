// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SolarWindTelemetryPanel,
  interpretWindSpeed,
} from "./SolarWindTelemetryPanel";
import type { SignalRecord } from "~/types/signal";

function makeSignal(speed: number): SignalRecord {
  return {
    timestamp: "2026-05-01T12:00:00Z",
    source: "noaa-swpc",
    signal: "solar-wind-speed",
    value: speed,
    unit: "km/s",
    confidence: 0.9,
    metadata: {},
  };
}

// ---------------------------------------------------------------------------
// interpretWindSpeed — pure function
// ---------------------------------------------------------------------------

describe("interpretWindSpeed", () => {
  it("returns CALM for speed below 400", () => {
    expect(interpretWindSpeed(350)).toBe("CALM");
    expect(interpretWindSpeed(0)).toBe("CALM");
    expect(interpretWindSpeed(399.9)).toBe("CALM");
  });

  it("returns ELEVATED for 400–600 inclusive", () => {
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
// SolarWindTelemetryPanel — pending state (signal = null)
// ---------------------------------------------------------------------------

describe("SolarWindTelemetryPanel — pending state", () => {
  it("renders the pending container", () => {
    render(<SolarWindTelemetryPanel signal={null} />);
    expect(screen.getByTestId("solar-wind-pending")).toBeInTheDocument();
  });

  it("shows awaiting ingest message", () => {
    render(<SolarWindTelemetryPanel signal={null} />);
    expect(
      screen.getByText(/Solar wind channel awaiting ingest/i)
    ).toBeInTheDocument();
  });

  it("shows the ingest command", () => {
    render(<SolarWindTelemetryPanel signal={null} />);
    expect(
      screen.getByText("npm run ingest:noaa-solar-wind")
    ).toBeInTheDocument();
  });

  it("shows the panel title even in pending state", () => {
    render(<SolarWindTelemetryPanel signal={null} />);
    expect(screen.getByText("Solar Wind · Speed")).toBeInTheDocument();
  });

  it("does not render wind-status in pending state", () => {
    render(<SolarWindTelemetryPanel signal={null} />);
    expect(screen.queryByTestId("wind-status")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SolarWindTelemetryPanel — with data
// ---------------------------------------------------------------------------

describe("SolarWindTelemetryPanel — with data", () => {
  it("renders speed value formatted to 1 decimal place", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("452.1")).toBeInTheDocument();
  });

  it("renders unit km/s", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("km/s")).toBeInTheDocument();
  });

  it("shows CALM status for speed below 400", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(350)} />);
    expect(screen.getByTestId("wind-status")).toHaveTextContent("CALM");
  });

  it("shows ELEVATED status for speed 400–600", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(500)} />);
    expect(screen.getByTestId("wind-status")).toHaveTextContent("ELEVATED");
  });

  it("shows HIGH SPEED STREAM status for speed above 600", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(650)} />);
    expect(screen.getByTestId("wind-status")).toHaveTextContent(
      "HIGH SPEED STREAM"
    );
  });

  it("renders source label", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("noaa-swpc")).toBeInTheDocument();
  });

  it("renders confidence as percentage", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(452.1)} />);
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("does not render the pending container when signal is present", () => {
    render(<SolarWindTelemetryPanel signal={makeSignal(452.1)} />);
    expect(screen.queryByTestId("solar-wind-pending")).not.toBeInTheDocument();
  });
});
