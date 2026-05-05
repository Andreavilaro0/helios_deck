// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHero } from "./DashboardHero";

const BASE_PROPS = {
  timestamp: "May 5 · 07:37 UTC",
  freshnessAge: "6h 19m",
  lastIngestedTime: "07:37 AM UTC",
  lastIngestedDate: "05/05/2026",
};

describe("DashboardHero", () => {
  it("renders QUIET variant with correct description and risk label", () => {
    render(<DashboardHero overallStatus="QUIET" {...BASE_PROPS} />);
    expect(screen.getByText(/QUIET/)).toBeInTheDocument();
    expect(screen.getByText(/Geomagnetic activity is at quiet levels/)).toBeInTheDocument();
    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("renders ACTIVE variant with correct description and risk label", () => {
    render(<DashboardHero overallStatus="ACTIVE" {...BASE_PROPS} />);
    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    expect(screen.getByText(/Elevated geomagnetic activity/)).toBeInTheDocument();
    expect(screen.getByText("MODERATE")).toBeInTheDocument();
  });

  it("renders STORM variant with correct description and risk label", () => {
    render(<DashboardHero overallStatus="STORM" {...BASE_PROPS} />);
    // h1 contains both lines joined by <br> — match with regex on the combined text
    expect(screen.getByText(/GEOMAGNETIC/)).toBeInTheDocument();
    expect(screen.getByText(/Geomagnetic storm in progress/)).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("shows freshnessAge in the Freshness mini-card", () => {
    render(<DashboardHero overallStatus="QUIET" {...BASE_PROPS} freshnessAge="3h 5m" />);
    expect(screen.getByText("3h 5m")).toBeInTheDocument();
  });

  it("shows lastIngestedTime and lastIngestedDate", () => {
    render(<DashboardHero overallStatus="QUIET" {...BASE_PROPS} />);
    expect(screen.getByText("07:37 AM UTC")).toBeInTheDocument();
    expect(screen.getByText("05/05/2026")).toBeInTheDocument();
  });

  it("shows timestamp", () => {
    render(<DashboardHero overallStatus="QUIET" {...BASE_PROPS} />);
    expect(screen.getByText("May 5 · 07:37 UTC")).toBeInTheDocument();
  });
});
