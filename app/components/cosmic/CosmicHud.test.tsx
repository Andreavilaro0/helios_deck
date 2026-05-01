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
