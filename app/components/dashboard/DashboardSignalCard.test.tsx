// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSignalCard } from "./DashboardSignalCard";

const BASE_PROPS = {
  label: "X-Ray Flux",
  subtitle: "Solar radiation level",
  value: "8.70e-7",
  unit: "W/m²",
  status: "B — MINOR",
  statusColor: "amber" as const,
  fresh: true,
  freshLabel: "8m",
  source: "noaa-goes",
  timestamp: "May 5, 07:37 AM UTC",
  tooltipText: "Measures solar X-ray emission intensity.",
};

describe("DashboardSignalCard", () => {
  it("renders label and value", () => {
    render(<DashboardSignalCard {...BASE_PROPS} />);
    expect(screen.getByText("X-Ray Flux")).toBeTruthy();
    expect(screen.getByText("8.70e-7")).toBeTruthy();
  });

  it("renders unit and status", () => {
    render(<DashboardSignalCard {...BASE_PROPS} />);
    expect(screen.getByText("W/m²")).toBeTruthy();
    expect(screen.getByText("B — MINOR")).toBeTruthy();
  });

  it("shows FRESH badge when fresh=true", () => {
    render(<DashboardSignalCard {...BASE_PROPS} fresh={true} freshLabel="8m" />);
    expect(screen.getByText("FRESH · 8m")).toBeTruthy();
  });

  it("shows STALE badge when fresh=false", () => {
    render(<DashboardSignalCard {...BASE_PROPS} fresh={false} freshLabel="2h" />);
    expect(screen.getByText("STALE · 2h")).toBeTruthy();
  });

  it("renders tooltip text", () => {
    render(<DashboardSignalCard {...BASE_PROPS} />);
    expect(screen.getByText("Measures solar X-ray emission intensity.")).toBeTruthy();
  });

  it("renders mini chart SVG when historyData has 2+ values", () => {
    const { container } = render(
      <DashboardSignalCard {...BASE_PROPS} historyData={[1, 2, 3, 4, 5]} />
    );
    const svg = container.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeTruthy();
  });

  it("does not render mini chart when historyData is empty", () => {
    const { container } = render(
      <DashboardSignalCard {...BASE_PROPS} historyData={[]} />
    );
    const svg = container.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeNull();
  });

  it("applies animation-delay from animationDelay prop", () => {
    const { container } = render(
      <DashboardSignalCard {...BASE_PROPS} animationDelay={160} />
    );
    const article = container.querySelector("article");
    expect(article?.style.animationDelay).toBe("160ms");
  });
});
