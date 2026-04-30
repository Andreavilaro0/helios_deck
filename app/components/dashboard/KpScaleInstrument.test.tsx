// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpScaleInstrument } from "./KpScaleInstrument";

describe("KpScaleInstrument", () => {
  it("shows the G1 storm threshold at Kp 5", () => {
    render(<KpScaleInstrument currentKp={2} />);
    expect(screen.getByText(/G1 STORM THRESHOLD/i)).toBeInTheDocument();
    expect(screen.getByText(/Kp ≥ 5/)).toBeInTheDocument();
  });

  it("shows QUIET status when Kp < 4", () => {
    render(<KpScaleInstrument currentKp={2} />);
    const statuses = screen.getAllByText("QUIET");
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("shows ACTIVE status when Kp = 4", () => {
    render(<KpScaleInstrument currentKp={4.3} />);
    const statuses = screen.getAllByText("ACTIVE");
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("shows STORM status when Kp >= 5", () => {
    render(<KpScaleInstrument currentKp={6} />);
    const statuses = screen.getAllByText("STORM");
    expect(statuses.length).toBeGreaterThan(0);
  });
});
