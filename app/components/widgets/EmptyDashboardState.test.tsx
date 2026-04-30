// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyDashboardState } from "./EmptyDashboardState";

describe("EmptyDashboardState", () => {
  it("shows the ingest command", () => {
    render(<EmptyDashboardState />);
    expect(screen.getByText("npm run ingest:noaa-kp")).toBeInTheDocument();
  });

  it("shows a no-data message", () => {
    render(<EmptyDashboardState />);
    expect(screen.getByText(/no signal data available/i)).toBeInTheDocument();
  });

  it("tells the user to reload after ingesting", () => {
    render(<EmptyDashboardState />);
    expect(screen.getByText(/reload this page/i)).toBeInTheDocument();
  });
});
