// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpScaleInstrument } from "./KpScaleInstrument";

describe("KpScaleInstrument", () => {
  it("shows CALMA status when Kp < 4", () => {
    render(<KpScaleInstrument currentKp={2} />);
    const statuses = screen.getAllByText("CALMA");
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("shows ACTIVO status when Kp = 4", () => {
    render(<KpScaleInstrument currentKp={4.3} />);
    const statuses = screen.getAllByText("ACTIVO");
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("shows TORMENTA status when Kp >= 5", () => {
    render(<KpScaleInstrument currentKp={6} />);
    const statuses = screen.getAllByText("TORMENTA");
    expect(statuses.length).toBeGreaterThan(0);
  });
});
