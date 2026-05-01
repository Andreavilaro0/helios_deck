// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CosmicHud } from "./CosmicHud";
import type { SignalRecord } from "~/types/signal";

const MOCK_SIGNAL: SignalRecord = {
  timestamp: "2026-04-29T16:00:00Z",
  source: "noaa-swpc",
  signal: "kp-index",
  value: 2.33,
  unit: "index",
  confidence: 0.9,
  metadata: {},
};

describe("CosmicHud", () => {
  it("shows HELIOS_DECK title", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.getByText("HELIOS_DECK")).toBeInTheDocument();
  });

  it("shows Kp value formatted to 2 decimals", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.getByText("2.33")).toBeInTheDocument();
  });

  it("shows QUIET status when Kp < 4", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.getByText("QUIET")).toBeInTheDocument();
  });

  it("shows ACTIVE status when Kp = 4.3", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={4.3} /></MemoryRouter>);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("shows STORM status when Kp >= 5", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={6} /></MemoryRouter>);
    expect(screen.getByText("STORM")).toBeInTheDocument();
  });

  it("shows source", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.getByText("noaa-swpc")).toBeInTheDocument();
  });

  it("shows SQLite → SSR pipeline", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.getByText("SQLite → SSR")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Solar wind secondary readout
// ---------------------------------------------------------------------------

const MOCK_WIND: SignalRecord = {
  timestamp: "2026-05-01T12:00:00Z",
  source: "noaa-swpc",
  signal: "solar-wind-speed",
  value: 452.1,
  unit: "km/s",
  confidence: 0.9,
  metadata: {},
};

describe("CosmicHud — solar wind secondary readout", () => {
  it("does not render wind readout when solarWind is not provided", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.queryByTestId("hud-wind-readout")).not.toBeInTheDocument();
  });

  it("renders wind speed and status when solarWind is provided", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={MOCK_WIND} /></MemoryRouter>);
    const readout = screen.getByTestId("hud-wind-readout");
    expect(readout).toBeInTheDocument();
    expect(readout.textContent).toMatch(/452\.1 km\/s/);
    expect(readout.textContent).toMatch(/ELEVATED/);
  });

  it("shows CALM for wind speed below 400", () => {
    const calmWind = { ...MOCK_WIND, value: 350 };
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={calmWind} /></MemoryRouter>);
    expect(screen.getByTestId("hud-wind-readout").textContent).toMatch(/CALM/);
  });

  it("shows HIGH SPEED STREAM for wind speed above 600", () => {
    const fastWind = { ...MOCK_WIND, value: 750 };
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={fastWind} /></MemoryRouter>);
    expect(screen.getByTestId("hud-wind-readout").textContent).toMatch(/HIGH SPEED STREAM/);
  });

  it("does not render wind readout when solarWind is null", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={null} /></MemoryRouter>);
    expect(screen.queryByTestId("hud-wind-readout")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// X-ray flux secondary readout
// ---------------------------------------------------------------------------

const MOCK_XRAY: SignalRecord = {
  timestamp: "2026-05-01T16:11:00Z",
  source: "noaa-swpc",
  signal: "xray-flux-long",
  value: 1.316572362242141e-8,
  unit: "W/m²",
  confidence: 0.9,
  metadata: {},
};

describe("CosmicHud — X-ray flux secondary readout", () => {
  it("does not render xray readout when xrayFlux is not provided", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.queryByTestId("hud-xray-readout")).not.toBeInTheDocument();
  });

  it("renders xray value and class when xrayFlux is provided", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} xrayFlux={MOCK_XRAY} /></MemoryRouter>);
    const readout = screen.getByTestId("hud-xray-readout");
    expect(readout).toBeInTheDocument();
    expect(readout.textContent).toMatch(/1\.32e-8 W\/m²/);
    expect(readout.textContent).toMatch(/A — QUIET/);
  });

  it("does not render xray readout when xrayFlux is null", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} xrayFlux={null} /></MemoryRouter>);
    expect(screen.queryByTestId("hud-xray-readout")).not.toBeInTheDocument();
  });

  it("shows X — EXTREME for X-class flux", () => {
    const extremeXray = { ...MOCK_XRAY, value: 1e-3 };
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} xrayFlux={extremeXray} /></MemoryRouter>);
    expect(screen.getByTestId("hud-xray-readout").textContent).toMatch(/X — EXTREME/);
  });
});
