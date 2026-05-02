// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ProtonFluxTelemetryPanel,
  interpretProtonFlux,
} from "./ProtonFluxTelemetryPanel";
import type { SignalRecord } from "~/types/signal";

// ---------------------------------------------------------------------------
// interpretProtonFlux — pure function
// ---------------------------------------------------------------------------

describe("interpretProtonFlux", () => {
  it("returns QUIET for value < 1 pfu", () => {
    expect(interpretProtonFlux(0.089)).toBe("QUIET");
  });

  it("returns QUIET for value at 0", () => {
    expect(interpretProtonFlux(0)).toBe("QUIET");
  });

  it("returns ELEVATED for value at exactly 1 pfu", () => {
    expect(interpretProtonFlux(1)).toBe("ELEVATED");
  });

  it("returns ELEVATED for value between 1 and 10 pfu", () => {
    expect(interpretProtonFlux(5.5)).toBe("ELEVATED");
  });

  it("returns RADIATION WATCH for value at exactly 10 pfu", () => {
    expect(interpretProtonFlux(10)).toBe("RADIATION WATCH");
  });

  it("returns RADIATION WATCH for value above 10 pfu", () => {
    expect(interpretProtonFlux(250)).toBe("RADIATION WATCH");
  });

  it("returns UNKNOWN for non-number value", () => {
    expect(interpretProtonFlux("0.089")).toBe("UNKNOWN");
  });

  it("returns UNKNOWN for null", () => {
    expect(interpretProtonFlux(null)).toBe("UNKNOWN");
  });
});

// ---------------------------------------------------------------------------
// ProtonFluxTelemetryPanel — pending state
// ---------------------------------------------------------------------------

describe("ProtonFluxTelemetryPanel — pending state", () => {
  it("renders pending message when signal is null", () => {
    render(<ProtonFluxTelemetryPanel signal={null} />);
    expect(screen.getByText("Proton channel awaiting ingest")).toBeInTheDocument();
  });

  it("renders ingest command hint in pending state", () => {
    render(<ProtonFluxTelemetryPanel signal={null} />);
    expect(screen.getByText("npm run ingest:noaa-proton-flux")).toBeInTheDocument();
  });

  it("renders panel header in pending state", () => {
    render(<ProtonFluxTelemetryPanel signal={null} />);
    expect(screen.getByText(/Proton Flux/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ProtonFluxTelemetryPanel — active state
// ---------------------------------------------------------------------------

function makeSignal(flux: number, energy = ">=10 MeV"): SignalRecord {
  return {
    timestamp: "2026-05-02T12:00:00Z",
    source: "noaa-swpc",
    signal: "proton-flux-10mev",
    value: flux,
    unit: "pfu",
    confidence: 0.9,
    metadata: { satellite: 18, energy },
  };
}

describe("ProtonFluxTelemetryPanel — active state", () => {
  it("renders the flux value in fixed-point notation", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    expect(screen.getByText("0.089")).toBeInTheDocument();
  });

  it("renders the unit pfu", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    expect(screen.getByText("pfu")).toBeInTheDocument();
  });

  it("renders source label", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    expect(screen.getByText("noaa-swpc")).toBeInTheDocument();
  });

  it("renders timestamp in UTC", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    const timeEl = document.querySelector("time");
    expect(timeEl?.getAttribute("dateTime")).toBe("2026-05-02T12:00:00Z");
  });

  it("renders confidence percentage", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("renders QUIET status for value < 1 pfu", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    expect(screen.getByTestId("proton-status").textContent).toBe("QUIET");
  });

  it("renders ELEVATED status for value between 1 and 10 pfu", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(3.5)} />);
    expect(screen.getByTestId("proton-status").textContent).toBe("ELEVATED");
  });

  it("renders RADIATION WATCH status for value >= 10 pfu", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(15)} />);
    expect(screen.getByTestId("proton-status").textContent).toBe("RADIATION WATCH");
  });

  it("renders energy channel from metadata when present", () => {
    render(<ProtonFluxTelemetryPanel signal={makeSignal(0.089)} />);
    expect(screen.getByText(">=10 MeV")).toBeInTheDocument();
  });

  it("omits energy channel row when metadata is empty", () => {
    const signal: SignalRecord = { ...makeSignal(0.089), metadata: {} };
    render(<ProtonFluxTelemetryPanel signal={signal} />);
    expect(screen.queryByText("ENERGY CHANNEL")).not.toBeInTheDocument();
  });
});
