// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CosmicEmptyState } from "./CosmicEmptyState";

describe("CosmicEmptyState", () => {
  it("shows no-data message", () => {
    render(<MemoryRouter><CosmicEmptyState /></MemoryRouter>);
    expect(screen.getByText(/no signal data available/i)).toBeInTheDocument();
  });

  it("shows ingest command", () => {
    render(<MemoryRouter><CosmicEmptyState /></MemoryRouter>);
    expect(screen.getByText("npm run ingest:noaa-kp")).toBeInTheDocument();
  });

  it("shows reload instruction", () => {
    render(<MemoryRouter><CosmicEmptyState /></MemoryRouter>);
    expect(screen.getByText(/reload this page/i)).toBeInTheDocument();
  });

  it("shows link back to dashboard", () => {
    render(<MemoryRouter><CosmicEmptyState /></MemoryRouter>);
    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
  });
});
