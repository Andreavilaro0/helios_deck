// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  XRayFluxTelemetryPanel,
  interpretXRayFlux,
} from "./XRayFluxTelemetryPanel";
import type { SignalRecord } from "~/types/signal";

function makeSignal(flux: number): SignalRecord {
  return {
    timestamp: "2026-05-01T16:11:00Z",
    source: "noaa-swpc",
    signal: "xray-flux-long",
    value: flux,
    unit: "W/m²",
    confidence: 0.9,
    metadata: { satellite: 19, energy: "0.1-0.8nm" },
  };
}

// ---------------------------------------------------------------------------
// interpretXRayFlux — pure function, no DOM needed
// ---------------------------------------------------------------------------

describe("interpretXRayFlux", () => {
  it("returns A — QUIET for value below 1e-7", () => {
    expect(interpretXRayFlux(1e-8)).toBe("A — QUIET");
    expect(interpretXRayFlux(0)).toBe("A — QUIET");
    expect(interpretXRayFlux(9.99e-8)).toBe("A — QUIET");
  });

  it("returns B — MINOR for value between 1e-7 and 1e-6", () => {
    expect(interpretXRayFlux(1e-7)).toBe("B — MINOR");
    expect(interpretXRayFlux(5e-7)).toBe("B — MINOR");
    expect(interpretXRayFlux(9.99e-7)).toBe("B — MINOR");
  });

  it("returns C — MODERATE for value between 1e-6 and 1e-5", () => {
    expect(interpretXRayFlux(1e-6)).toBe("C — MODERATE");
    expect(interpretXRayFlux(5e-6)).toBe("C — MODERATE");
    expect(interpretXRayFlux(9.99e-6)).toBe("C — MODERATE");
  });

  it("returns M — SIGNIFICANT for value between 1e-5 and 1e-4", () => {
    expect(interpretXRayFlux(1e-5)).toBe("M — SIGNIFICANT");
    expect(interpretXRayFlux(5e-5)).toBe("M — SIGNIFICANT");
    expect(interpretXRayFlux(9.99e-5)).toBe("M — SIGNIFICANT");
  });

  it("returns X — EXTREME for value >= 1e-4", () => {
    expect(interpretXRayFlux(1e-4)).toBe("X — EXTREME");
    expect(interpretXRayFlux(1e-3)).toBe("X — EXTREME");
  });

  it("returns UNKNOWN for non-numeric value", () => {
    expect(interpretXRayFlux("high")).toBe("UNKNOWN");
    expect(interpretXRayFlux(null)).toBe("UNKNOWN");
    expect(interpretXRayFlux(undefined)).toBe("UNKNOWN");
    expect(interpretXRayFlux({})).toBe("UNKNOWN");
  });
});

// ---------------------------------------------------------------------------
// XRayFluxTelemetryPanel — pending state (signal is null)
// ---------------------------------------------------------------------------

describe("XRayFluxTelemetryPanel — pending state", () => {
  it("shows pending message when signal is null", () => {
    render(<XRayFluxTelemetryPanel signal={null} />);
    expect(
      screen.getByText("X-ray channel awaiting ingest")
    ).toBeInTheDocument();
    expect(
      screen.getByText("npm run ingest:noaa-xray-flux")
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// XRayFluxTelemetryPanel — active state (signal present)
// ---------------------------------------------------------------------------

describe("XRayFluxTelemetryPanel — active state", () => {
  it("renders value in scientific notation", () => {
    render(<XRayFluxTelemetryPanel signal={makeSignal(1.316572362242141e-8)} />);
    expect(screen.getByText("1.32e-8")).toBeInTheDocument();
  });

  it("renders unit W/m²", () => {
    render(<XRayFluxTelemetryPanel signal={makeSignal(1e-7)} />);
    expect(screen.getByText("W/m²")).toBeInTheDocument();
  });

  it("renders source noaa-swpc", () => {
    render(<XRayFluxTelemetryPanel signal={makeSignal(1e-7)} />);
    expect(screen.getByText("noaa-swpc")).toBeInTheDocument();
  });

  it("shows xray-status with correct class label for A-class flux", () => {
    render(<XRayFluxTelemetryPanel signal={makeSignal(1e-8)} />);
    expect(screen.getByTestId("xray-status")).toHaveTextContent("A — QUIET");
  });

  it("renders energy band from metadata", () => {
    render(<XRayFluxTelemetryPanel signal={makeSignal(1e-7)} />);
    expect(screen.getByText("0.1-0.8nm")).toBeInTheDocument();
  });

  it("renders satellite from metadata", () => {
    render(<XRayFluxTelemetryPanel signal={makeSignal(1e-7)} />);
    expect(screen.getByText("19")).toBeInTheDocument();
  });

  it("does not render SATELLITE row when satellite metadata is null", () => {
    const signal: SignalRecord = { ...makeSignal(1e-7), metadata: { satellite: null } };
    render(<XRayFluxTelemetryPanel signal={signal} />);
    expect(screen.queryByText("SATELLITE")).not.toBeInTheDocument();
  });

  it("does not render metadata rows when metadata is empty", () => {
    const signal: SignalRecord = { ...makeSignal(1e-7), metadata: {} };
    render(<XRayFluxTelemetryPanel signal={signal} />);
    expect(screen.queryByText("ENERGY BAND")).not.toBeInTheDocument();
    expect(screen.queryByText("SATELLITE")).not.toBeInTheDocument();
  });
});
