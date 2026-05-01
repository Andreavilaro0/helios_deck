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

const MOCK_WIND: SignalRecord = {
  timestamp: "2026-05-01T12:00:00Z",
  source: "noaa-swpc",
  signal: "solar-wind-speed",
  value: 452.1,
  unit: "km/s",
  confidence: 0.9,
  metadata: {},
};

// ---------------------------------------------------------------------------
// Kp readout
// ---------------------------------------------------------------------------

describe("CosmicHud — Kp readout", () => {
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

describe("CosmicHud — solar wind readout", () => {
  it("shows pending message when solarWind is not provided", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} /></MemoryRouter>);
    expect(screen.getByTestId("hud-wind-pending")).toBeInTheDocument();
    expect(screen.getByText(/Solar wind channel pending/i)).toBeInTheDocument();
  });

  it("shows pending message when solarWind is null", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={null} /></MemoryRouter>);
    expect(screen.getByTestId("hud-wind-pending")).toBeInTheDocument();
  });

  it("shows speed and ELEVATED status when solarWind is provided", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={MOCK_WIND} /></MemoryRouter>);
    const readout = screen.getByTestId("hud-wind-readout");
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

  it("does not show pending message when solarWind data is present", () => {
    render(<MemoryRouter><CosmicHud signal={MOCK_SIGNAL} kp={2.33} solarWind={MOCK_WIND} /></MemoryRouter>);
    expect(screen.queryByTestId("hud-wind-pending")).not.toBeInTheDocument();
  });
});
