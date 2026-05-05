// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineFooter } from "./PipelineFooter";

describe("PipelineFooter", () => {
  it("renders source name uppercased", () => {
    render(<PipelineFooter source="noaa-swpc" recordCount={60} maxKp={2.0} avgKp={1.71} />);
    expect(screen.getByText(/NOAA-SWPC/)).toBeTruthy();
  });

  it("renders record count and stats", () => {
    render(<PipelineFooter source="noaa-swpc" recordCount={60} maxKp={2.0} avgKp={1.71} />);
    expect(screen.getByText(/60 readings/)).toBeTruthy();
    expect(screen.getByText(/Max 2\.00/)).toBeTruthy();
    expect(screen.getByText(/Avg 1\.71/)).toBeTruthy();
  });
});
